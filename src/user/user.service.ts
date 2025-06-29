import * as jwt from "jsonwebtoken";
import * as bcrypt from 'bcryptjs';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ConfigService } from "@nestjs/config";
import { UserTokenStruct } from "../core/struct";
import { AccessLevel } from "../core/enums";
import { AuthUserDto } from "./dto/auth-user.dto";
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema';
import { SampleStoriesService } from '../scripts/sample-stories.service';
import { Role, RoleDocument } from '../schemas/role.schema';
import { Person, PersonDocument } from '../schemas/person.schema';
import { Creator, CreatorDocument } from '../schemas/creator.schema';
import { Post, PostDocument } from '../post/post.schema';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    @InjectModel(Person.name) private personModel: Model<PersonDocument>,
    @InjectModel(Creator.name) private creatorModel: Model<CreatorDocument>,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private config: ConfigService,
  ) { }

  async create(createUserDto: CreateUserDto, id_upload?: Express.Multer.File): Promise<UserDocument> {
    const userExists = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (userExists) {
      throw new ConflictException("User already exists");
    }

    const userRole = await this.roleModel.findOne({ name: "user" }).exec();
    if (!userRole) {
      throw new NotFoundException("User registration is not available at the moment");
    }

    // Parse name into firstName and lastName
    let firstName = createUserDto.name;
    let lastName = '';
    const nameParts = createUserDto.name.trim().split(' ');
    if (nameParts.length > 1) {
      firstName = nameParts[0];
      lastName = nameParts.slice(1).join(' ');
    }

    const personData: any = {
      firstName,
      lastName,
    };

    // Handle optional bio
    if (createUserDto.bio) {
      personData.bio = createUserDto.bio;
    }

    // Handle identityFile upload - save file path or buffer
    if (id_upload) {
      // Assuming person schema has profilePicture field to store file path or buffer
      personData.profilePicture = id_upload.path || id_upload.filename || null;
    }

    const person = new this.personModel(personData);
    await person.save();

    const userData: any = {
      email: createUserDto.email,
      password: await bcrypt.hash(createUserDto.password, 10),
      roles: [userRole._id],
      person: person._id,
    };

    // Handle optional username - assuming user schema has username field
    if (createUserDto.username) {
      userData.username = createUserDto.username;
    }

    const user = new this.userModel(userData);
    await user.save();

    const token = jwt.sign(
      {
        email: user.email,
        roles: [userRole.name],
      },
      this.config.getOrThrow("JWT_SECRET") as string,
      { expiresIn: "1h" },
    );
    const refreshToken = jwt.sign(
      { token },
      this.config.getOrThrow("JWT_REFRESH_SECRET") as string,
      { expiresIn: "7d" },
    );

    return user;
  }

  // New method to get simplified user list for search
  async getSimpleUsers(): Promise<{ id: string; name: string }[]> {
    const users = await this.userModel.find().populate('person').exec();
    return users.map(user => ({
      id: (user._id as any).toString(),
      name: user.person.firstName + (user.person.lastName ? ' ' + user.person.lastName : ''),
    }));
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().populate('person').populate('roles').exec();
  }

  async findOne(id: string): Promise<UserDocument> {
    const user = await this.userModel.findById(id).populate('person').populate('roles').exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<UserDocument> {
    const user = await this.userModel.findOne({ email }).populate('person').populate('roles').exec();
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(id, updateUserDto, { new: true }).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async remove(id: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndDelete(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findRoles(): Promise<RoleDocument[]> {
    return this.roleModel.find().exec();
  }

  async findRoleByName(name: string): Promise<RoleDocument> {
    const role = await this.roleModel.findOne({ name }).exec();
    if (!role) {
      throw new NotFoundException(`Role with name ${name} not found`);
    }
    return role;
  }

  async createRole(name: string, description?: string): Promise<RoleDocument> {
    const createdRole = new this.roleModel({ name, description });
    return createdRole.save();
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $addToSet: { roles: roleId } },
      { new: true }
    ).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async removeRoleFromUser(userId: string, roleId: string): Promise<UserDocument> {
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $pull: { roles: roleId } },
      { new: true }
    ).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async login(loginDto: AuthUserDto): Promise<{ message: string; data: any }> {
    const user = await this.userModel.findOne({ email: loginDto.email })
      .populate<{ person: PersonDocument }>('person')
      .populate<{ roles: RoleDocument[] }>('roles')
      .exec();

    if (!user) {
      throw new NotFoundException("Account not found");
    }

    if (!user.password) {
      throw new UnauthorizedException("Invalid password");
    }

    if (await bcrypt.compare(loginDto.password, user.password)) {
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          roles: user.roles.map((role) => role.name),
        },
        this.config.getOrThrow("JWT_SECRET") as string,
        { expiresIn: "1h" },
      );
      const refreshToken = jwt.sign(
        { token },
        this.config.getOrThrow("JWT_REFRESH_SECRET") as string,
        { expiresIn: "7d" },
      );

      return {
        message: `Welcome back 👋🏽, ${user.person.firstName}`,
        data: {
          firstName: user.person.firstName,
          lastName: user.person.lastName,
          email: user.email,
          roles: user.roles,
          token,
          refreshToken,
        },
      };
    }

    throw new UnauthorizedException("Invalid password");
  }

  async validate(token: string, accessLevel: AccessLevel) {
    try {
      const secret = this.config.getOrThrow("JWT_SECRET");
      const decoded: UserTokenStruct = jwt.verify(token, secret) as UserTokenStruct;

      const user = await this.userModel.findById(decoded.id)
        .populate('roles')
        .populate('person')
        .exec();

      if (!user) {
        throw new NotFoundException("User not found");
      }

      const hasRequiredRole = user.roles.some((role: any) => role.name === accessLevel);
      if (!hasRequiredRole) {
        throw new UnauthorizedException("Unauthorized");
      }

      return {
        isValid: true,
        user,
      };
    } catch (error) {
      return {
        isValid: false,
        user: null,
      };
    }
  }

  async getAll(token: string): Promise<UserDocument[]> {
    const isAdmin = await this.validate(token, AccessLevel.ADMINISTRATOR);
    const isSuperAdmin = await this.validate(token, AccessLevel.SUPER_ADMINISTRATOR);

    if (!isAdmin.isValid && !isSuperAdmin.isValid) {
      throw new UnauthorizedException("Access Denied");
    }

    const users = await this.userModel.find()
      .populate('person')
      .populate('roles')
      .exec();

    return users.map(user => {
      user.password = undefined;
      return user;
    });
  }

  async getUserFromToken(token: string): Promise<UserDocument> {
    try {
      const decoded = jwt.verify(token, this.config.getOrThrow("JWT_SECRET")) as { userId: string };
      const user = await this.userModel.findById(decoded.userId).exec();
      if (!user) {
        throw new InternalServerErrorException("User not found");
      }
      return user;
    } catch (error) {
      throw new InternalServerErrorException("Invalid token");
    }
  }

  // Find user by email
  async findByEmailMongoose(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async getProfileByUserId(userId: string) {
    console.log('getProfileByUserId called with userId:', userId);
    const user = await this.userModel
      .findById(userId)
      .populate<{ person: PersonDocument }>("person")
      .populate<{ roles: RoleDocument[] }>("roles")
      .exec();

    if (!user) throw new NotFoundException("User not found");

    console.log('getProfileByUserId called with userId:', userId);
    console.log('User creator field:', user.creator);

    // Fetch creator document separately by user.creator ObjectId
    let creatorDoc: CreatorDocument | null = null;
    if (user.creator) {
      console.log('Looking for creator document with id:', user.creator);
      creatorDoc = await this.creatorModel.findById(user.creator).exec();
      console.log('Fetched creator document:', creatorDoc);
    }

    // Fetch posts authored by the user
    const posts = await this.postModel.find({ userId: userId }).populate('userId', '_id username').exec();

    return {
      message: "User profile retrieved successfully",
      data: {
        id: user.id,
        email: user.email,
        person: {
          firstName: user.person.firstName,
          lastName: user.person.lastName,
          profilePicture: user.person.profilePicture,
        },
        roles: user.roles.map((r) => ({ name: r.name })),
        creator: creatorDoc,
        posts: posts.map(post => ({
          ...post.toObject(),
          authorId: post.userId ? post.userId._id : null,
        })),
      },
    };
  }

  async updateProfileByUserId(
    userId: string,
    dto: UpdateUserProfileDto,
  ) {
    console.log('updateProfileByUserId called with userId:', userId);
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    // update Person fields
    const personUpdate: Partial<Person> = {};
    if (dto.firstName) personUpdate.firstName = dto.firstName;
    if (dto.lastName) personUpdate.lastName = dto.lastName;
    if (dto.otherName) personUpdate.middleName = dto.otherName;
    if (dto.dateOfBirth) personUpdate.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.gender) personUpdate.gender = dto.gender;
    if (dto.profilePicture) personUpdate.profilePicture = dto.profilePicture;
    if (dto.bio) personUpdate.bio = dto.bio;
    if (dto.profession) personUpdate.profession = dto.profession;
    if (dto.location) personUpdate.location = dto.location;
    if (dto.interests) personUpdate.interests = dto.interests;
    if (dto.instagram) personUpdate.instagram = dto.instagram;
    if (dto.facebook) personUpdate.facebook = dto.facebook;
    if (dto.linkedin) personUpdate.linkedin = dto.linkedin;

    await this.personModel.findByIdAndUpdate(user.person, personUpdate).exec();

    // update Creator fields (bio, profession, etc.)
    const creatorUpdate: Partial<Creator> = {};
    if (dto.bio) creatorUpdate.bio = dto.bio;
    if (dto.profession) creatorUpdate.profession = dto.profession;
    if (dto.location) creatorUpdate.location = dto.location;
    if (dto.interests && dto.interests.length > 0) creatorUpdate.interests = dto.interests;
    if (dto.instagram) creatorUpdate.instagram = dto.instagram;
    if (dto.facebook) creatorUpdate.facebook = dto.facebook;
    if (dto.linkedin) creatorUpdate.linkedin = dto.linkedin;

    // Convert userId to ObjectId for queries
    const userObjectId = new Types.ObjectId(userId);

    // Check if creator document exists for user
    let existingCreator = await this.creatorModel.findOne({ user: userObjectId }).exec();
    if (existingCreator) {
      existingCreator = await this.creatorModel.findOneAndUpdate(
        { user: userObjectId },
        creatorUpdate,
        { new: true }
      ).exec();
      if (!existingCreator) {
        throw new InternalServerErrorException('Failed to update creator document');
      }
      // Explicitly set the creator field in the user document
      try {
        console.log('Updating user document creator field for userObjectId:', userObjectId, 'with creatorId:', existingCreator._id);
        const updateResult = await this.userModel.updateOne(
          { _id: userObjectId },
          { $set: { creator: existingCreator._id } }
        ).exec();
        console.log('Update result:', updateResult);
        if (updateResult.modifiedCount === 0) {
          console.warn('No documents modified during user creator update, but update is considered successful');
          // Do not throw error here because the field might already be set to the same value
        }
        console.log('User document updated with creator field:', updateResult);
      } catch (error) {
        console.error('Error updating user creator field:', error);
        throw new InternalServerErrorException('Failed to update user with creator reference');
      }
      return this.getProfileByUserId(userId);
    } else {
      // Create new creator document with userId and creatorUpdate fields
      const newCreator = new this.creatorModel({
        user: userObjectId,
        uid: userId,
        ...creatorUpdate,
      });
      const savedCreator = await newCreator.save();
      if (!savedCreator) {
        throw new InternalServerErrorException('Failed to create creator document');
      }

      // Update user document's creator field with new creator id
      try {
        const updateResult = await this.userModel.updateOne(
          { _id: userObjectId },
          { $set: { creator: savedCreator._id } }
        ).exec();
        if (updateResult.modifiedCount === 0) {
          throw new InternalServerErrorException('Failed to update user with creator reference');
        }
        console.log('User document updated with creator field:', updateResult);
      } catch (error) {
        console.error('Error updating user creator field:', error);
        throw new InternalServerErrorException('Failed to update user with creator reference');
      }
    }

    return this.getProfileByUserId(userId);
  }

  async addBookToSaved(userId: string, bookId: string) {
    // Import SampleStoriesService dynamically to avoid import issues
    const { SampleStoriesService } = await import('../scripts/sample-stories.service');
    // Check if bookId is a valid ObjectId (database story) or sample story id (string)
    let isSampleStory = false;
    if (!Types.ObjectId.isValid(bookId)) {
      // Not a valid ObjectId, check if it exists in sample stories
      const sampleStory = SampleStoriesService.getStoryById(bookId);
      if (!sampleStory) {
        throw new NotFoundException('Book not found');
      }
      isSampleStory = true;
    }
    if (isSampleStory) {
      // For sample stories, store the string id in savedBooks array
      const user = await this.userModel.findById(userId).exec();
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const alreadySaved = user.savedBooks.some(id => id.toString() === bookId);
      if (alreadySaved) {
        return { updatedUser: user, alreadySaved: true };
      }
      // Cast bookId to any to avoid ObjectId type error
      user.savedBooks.push(bookId as any);
      await user.save();
      await user.populate('savedBooks');
      user.password = undefined;
      return { updatedUser: user, alreadySaved: false };
    } else {
      // For database stories, use existing logic
      const bookObjectId = new Types.ObjectId(bookId);
      const updatedUser = await this.userModel.findByIdAndUpdate(
        userId,
        { $addToSet: { savedBooks: bookObjectId } },
        { new: true, runValidators: false }
      ).populate('savedBooks')
      .select('-password')
      .exec();
      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }
      return { updatedUser, alreadySaved: false };
    }
  }
}
