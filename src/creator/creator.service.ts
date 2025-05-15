/* eslint-disable @typescript-eslint/no-unused-vars */
import * as jwt from "jsonwebtoken";
import {
  ConflictException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { CreateCreatorDto } from "./dto/create-creator.dto";
import { UpdateCreatorDto } from "./dto/update-creator.dto";
import { AuthCreatorDto } from "./dto/auth-creator.dto";
import * as bcrypt from 'bcryptjs';
import { ConfigService } from "@nestjs/config";
import { GoogleAuthCreatorDto } from "./dto/google-auth-creator.dto";
import { AccessLevel, AccessMethod } from "../core/enums";
import { OAuth2Client } from "google-auth-library";
import { UserService } from "src/user/user.service";
import { MediaService } from "src/media/media.service";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { JwtService } from "@nestjs/jwt";
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Creator, CreatorDocument } from '../schemas/creator.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { Person, PersonDocument } from '../schemas/person.schema';
import { Role, RoleDocument } from '../schemas/role.schema';
import { UpdateProfileDto } from "./dto/update-profile.dto";

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class CreatorService {
  constructor(
    @InjectModel(Creator.name) private creatorModel: Model<CreatorDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Person.name) private personModel: Model<PersonDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
    private config: ConfigService,
    private userService: UserService,
    private mediaService: MediaService,
    private jwtService: JwtService,
  ) {}

  async create(createCreatorDto: CreateCreatorDto): Promise<CreatorDocument> {
    console.log(`[CreatorService.create] signup attempt for email: ${createCreatorDto.email}`);
    try {
      const userExists = await this.userModel.findOne({ email: createCreatorDto.email }).exec();
      console.log('[CreatorService.create] userExists:', userExists);
      if (userExists) {
        console.log(
          `[CreatorService.create] existing account accessMethod: ${userExists.accessMethod}`
        );
        // block if already signed up via email/password
        if (userExists.accessMethod === AccessMethod.EMAIL_PASSWORD) {
          throw new ConflictException("Creator already has an account with this email");
        }
        // existing Google-only user: link to email/password
        userExists.password = await bcrypt.hash(createCreatorDto.password, 10);
        userExists.accessMethod = AccessMethod.EMAIL_PASSWORD;
        await userExists.save();
        // create creator profile linked to existing user
        const creator = new this.creatorModel({
          uid: userExists.id,
          user: userExists._id,
          idUploadUrl: createCreatorDto.idUploadUrl,
        });
        await creator.save();
        const created = await this.creatorModel
          .findById(creator._id)
          .populate({ path: 'user', populate: 'person' })
          .exec();
        if (!created) {
          throw new InternalServerErrorException('Failed to retrieve created creator');
        }
        return created;
      }

      const creatorRole = await this.roleModel.findOne({ name: "creator" }).exec();
      if (!creatorRole) {
        throw new NotFoundException("Creator registration is not available at the moment");
      }

      // Split the name into firstName and lastName
      const nameParts = createCreatorDto.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ');

      const person = new this.personModel({
        firstName,
        lastName,
      });
      await person.save();

      const user = new this.userModel({
        email: createCreatorDto.email,
        password: await bcrypt.hash(createCreatorDto.password, 10),
        roles: [creatorRole._id],
        person: person._id,
        accessMethod: AccessMethod.EMAIL_PASSWORD,
      });
      await user.save();

      const creator = new this.creatorModel({
        uid: user.id,
        user: user._id,
        idUploadUrl: createCreatorDto.idUploadUrl,
      });
      await creator.save();

      const created = await this.creatorModel
        .findById(creator._id)
        .populate({ path: 'user', populate: 'person' })
        .exec();
      if (!created) {
        throw new InternalServerErrorException('Failed to retrieve created creator');
      }
      return created;
    } catch (error) {
      console.error("Error in CreatorService.create:", error);
      // if it's a Nest HTTP exception, let it bubble
      if (error instanceof HttpException) {
        throw error;
      }
      // handle Mongo duplicate key errors
      if ((error as any)?.code === 11000) {
        throw new ConflictException("A record already exists with given parameters");
      }
      throw new InternalServerErrorException((error as Error).message || "Error creating creator account");
    }
  }

  async findAll(): Promise<CreatorDocument[]> {
    return this.creatorModel.find().populate('user').exec();
  }

  async findOne(id: string): Promise<CreatorDocument> {
    const creator = await this.creatorModel.findById(id).populate('user').exec();
    if (!creator) {
      throw new NotFoundException(`Creator with ID ${id} not found`);
    }
    return creator;
  }

  async update(id: string, updateCreatorDto: UpdateCreatorDto): Promise<CreatorDocument> {
    const creator = await this.creatorModel.findByIdAndUpdate(id, updateCreatorDto, { new: true }).exec();
    if (!creator) {
      throw new NotFoundException(`Creator with ID ${id} not found`);
    }
    return creator;
  }

  async remove(id: string): Promise<CreatorDocument> {
    const creator = await this.creatorModel.findByIdAndDelete(id).exec();
    if (!creator) {
      throw new NotFoundException(`Creator with ID ${id} not found`);
    }
    return creator;
  }

  async login(authCreatorDto: AuthCreatorDto) {
    try {
      const userExists = await this.userModel
        .findOne({ email: authCreatorDto.email, accessMethod: AccessMethod.EMAIL_PASSWORD })
        .populate('roles')
        .populate('person')
        .populate('creator')
        .exec();

      if (!userExists) {
        throw new NotFoundException("Account not found");
      }

      // Fetch the 'creator' role from the roles collection
      const creatorRole = await this.roleModel
        .findOne({ name: "creator" })
        .exec();

      if (!creatorRole) {
        throw new NotFoundException(
          "Creator role is not available at the moment",
        );
      }

      // check if the user has the creator role
      const hasRole = userExists.roles.some(
        (role) => role.name === creatorRole.name,
      );

      if (!userExists.creator && !hasRole) {
        throw new UnauthorizedException("Account is not a creator account");
      }

      const creator = await this.creatorModel.findOne({
        user: userExists._id
      }).populate({
        path: 'user',
        populate: [
          { path: 'person' },
          { path: 'roles' }
        ]
      }).exec();
      if (creator) {
        if (!creator.user.password) {
          throw new UnauthorizedException("Invalid password");
        }
        if (await bcrypt.compare(authCreatorDto.password!, creator.user.password)) {
          // sign a new token
          const token = jwt.sign(
            {
              id: creator.user.id,
              email: creator.user.email,
              roles: creator.user.roles.map((role) => role.name),
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
            message: `Welcome back 👋🏽, ${creator.user.person.firstName}`,
            data: {
              firstName: creator.user.person.firstName,
              lastName: creator.user.person.lastName,
              email: creator.user.email,
              token,
              refreshToken,
            },
          };
        }

        throw new UnauthorizedException("Password is Incorrect");
      }
      throw new NotFoundException("Account not found");
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async getProfile(token: string): Promise<{
    message: string;
    data: {
      id: number;
      email: string;
      person: {
        firstName: string;
        lastName: string;
        profilePicture?: string;
      };
      roles: Array<{ name: string }>;
    };
  }> {
    try {
      const isCreator = await this.userService.validate(
        token,
        AccessLevel.CREATOR,
      );

      if (!isCreator.isValid || !isCreator.user || !isCreator.user.creator) {
        throw new UnauthorizedException(
          "You're not authorized to perform this action",
        );
      }

      const creator = await this.creatorModel.findOne({
        where: {
          id: isCreator.user?.creator?.id,
        },
        relations: ["user", "user.person"],
      });

      if (!creator || !creator.user || !creator.user.person) {
        throw new NotFoundException("Creator not found");
      }
      //remove password from the response
      const { password, ...rest } = creator.user;

      return {
        message: "Creator profile retrieved successfully",
        data: {
          id: creator.user.id,
          email: creator.user.email,
          person: {
            firstName: creator.user.person.firstName,
            lastName: creator.user.person.lastName,
            profilePicture: creator.user.person.profilePicture,
          },
          roles: creator.user.roles.map((role) => ({ name: role.name })),
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getBankDetails(token: string) {
    try {
      const isCreator = await this.userService.validate(
        token,
        AccessLevel.CREATOR,
      );

      if (!isCreator.isValid || !isCreator.user || !isCreator.user.creator) {
        throw new UnauthorizedException(
          "You're not authorized to perform this action",
        );
      }

      const creator = await this.creatorModel.findOne({
        where: {
          id: isCreator.user.creator.id,
        },
        relations: ["user", "user.person"],
      });

      if (!creator) {
        throw new NotFoundException("Creator not found");
      }

      return {
        message: "Bank details retrieved successfully",
        data: creator.user.bankAccounts,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async findByUserId(userId: string): Promise<CreatorDocument> {
    const creator = await this.creatorModel.findOne({ user: userId }).exec();
    if (!creator) {
      throw new NotFoundException(`Creator with user ID ${userId} not found`);
    }
    return creator;
  }

  async changePassword(token: string, updatePasswordDto: UpdatePasswordDto) {
    try {
      const isCreator = await this.userService.validate(
        token,
        AccessLevel.CREATOR,
      );

      if (!isCreator.isValid || !isCreator.user || !isCreator.user.creator) {
        throw new UnauthorizedException(
          "You're not authorized to perform this action",
        );
      }

      const creator = await this.creatorModel.findOne({
        where: {
          id: isCreator.user.creator.id,
        },
        relations: ["user"],
      });

      if (!creator) {
        throw new NotFoundException("Creator not found");
      }

      if (!creator.user.password || !updatePasswordDto.currentPassword) {
        throw new UnauthorizedException("Password is required");
      }

      if (!await bcrypt.compare(updatePasswordDto.currentPassword, creator.user.password)) {
        throw new UnauthorizedException("Old password is incorrect");
      }

      creator.user.password = await bcrypt.hash(updatePasswordDto.newPassword, 10);
      await this.userModel.findByIdAndUpdate(creator.user._id, { password: creator.user.password }).exec();

      return {
        message: "Password updated successfully",
      };
    } catch (error) {
      throw error;
    }
  }

  async uploadProfilePicture(
    token: string,
    profilePicture: Express.Multer.File,
  ) {
    try {
      const isCreator = await this.userService.validate(
        token,
        AccessLevel.CREATOR,
      );

      if (!isCreator.isValid || !isCreator.user || !isCreator.user.creator) {
        throw new UnauthorizedException(
          "You're not authorized to perform this action",
        );
      }

      // upload the profile picture
      const { status, url } = await this.mediaService.uploadMedia(
        "/creators/profile/avatar/",
        profilePicture,
      );

      // check if the upload was successful
      if (!status) {
        throw new InternalServerErrorException(
          "Unable to upload profile picture",
        );
      }

      // update the creator's profile picture
      const creator = await this.creatorModel.findOne({
        where: {
          id: isCreator.user.creator.id,
        },
        relations: ["user", "user.person"],
      });

      if (!creator || !creator.user || !creator.user.person) {
        throw new NotFoundException("Creator not found");
      }
      creator.user.person.profilePicture = url;
      await this.personModel.findByIdAndUpdate(creator.user.person._id, { profilePicture: url }).exec();

      return {
        message: "Profile picture uploaded successfully",
        data: url,
      };
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async googleAuth(googleAuthCreatorDto: GoogleAuthCreatorDto) {
    try {
      let creator = await this.creatorModel.create({});
      const user = await this.userModel.create({});
      const person = await this.personModel.create({});

      let message = "";

      // verify the google token from google api
      const client = new OAuth2Client();
      const ticket = await client.verifyIdToken({
        idToken: googleAuthCreatorDto.token,
        audience: this.config.getOrThrow("GOOGLE_CLIENT_ID"),
      });
      
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload?.email || !payload?.given_name || !payload?.family_name) {
        throw new UnauthorizedException("Invalid Google token payload");
      }

      // Now TypeScript knows these values are defined
      const { sub: userID, email, given_name: firstName, family_name: lastName } = payload;

      const creatorAccount = await this.creatorModel.findOne({
        where: {
          user: {
            email,
            accessMethod: AccessMethod.GOOGLE,
          },
        },
        relations: ["user", "user.roles", "user.person"],
      });

      if (!creatorAccount) {
        person.firstName = firstName;
        person.lastName = lastName;
        user.accessMethod = AccessMethod.GOOGLE;
        user.uid = userID;
        user.email = email;

        // Fetch the 'user' role from the role repository
        const creatorRole = await this.roleModel.findOne({
          where: {
            name: "creator",
          },
        });

        if (!creatorRole) {
          throw new NotFoundException(
            "Creator registration is not available at the moment",
          );
        }

        user.roles = [creatorRole];

        const registeredPerson = await this.personModel.create(person);
        const registeredUser = await this.userModel.create({
          ...user,
          person: registeredPerson
        });

        await registeredPerson.save();
        await registeredUser.save();

        creator.user = registeredUser;

        await this.personModel.create(registeredPerson);
        await this.userModel.create(registeredUser);
        await this.creatorModel.create(creator);

        message = `Welcome to Storycreate, ${creator.user.person.firstName}`;
      } else {
        creator = creatorAccount;
        message = `Welcome Back 👋🏽, ${creator.user.person.firstName}`;
      }

      const token = jwt.sign(
        {
          id: creator.user.id,
          email: creator.user.email,
          roles: creator.user.roles.map((role) => role.name),
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
        message,
        data: {
          firstName: creator.user.person.firstName,
          lastName: creator.user.person.lastName,
          email: creator.user.email,
          token,
          refreshToken,
        },
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async updateCreator(token: string, updateCreatorDto: UpdateCreatorDto) {
    try {
      if (!token) {
        throw new UnauthorizedException("Token is required");
      }

      const jwtSecret = this.config.get<string>("JWT_SECRET");
      if (!jwtSecret) {
        throw new Error("JWT_SECRET is not configured");
      }

      const isCreator = await this.validateCreator(token);
      if (!isCreator?.isValid || !isCreator?.user?.creator?.id) {
        throw new UnauthorizedException(
          "You're not authorized to perform this action",
        );
      }

      // Convert string ID to number for TypeORM
      const creatorId = Number(isCreator.user.creator.id);
      const creator = await this.creatorModel.findOne({
        where: { id: creatorId },
        relations: ["user"],
      });

      if (!creator?.id || !creator.user?.id) {
        throw new NotFoundException("Creator or user not found");
      }

      let payload: JwtPayload;
      try {
        payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
          secret: jwtSecret,
        });

        if (!payload?.sub) {
          throw new UnauthorizedException("Invalid token payload");
        }
      } catch (error) {
        throw new UnauthorizedException("Invalid token");
      }

      // Convert string ID to number for TypeORM
      const userId = Number(payload.sub);
      const user = await this.userModel.findOne({
        where: { id: userId },
      });

      if (!user?.id) {
        throw new NotFoundException("User not found");
      }

      if (user.id !== creator.user.id) {
        throw new UnauthorizedException(
          "You're not authorized to perform this action",
        );
      }

      const updatedCreator = await this.creatorModel.create({
        ...creator,
        ...updateCreatorDto,
      });

      return updatedCreator;
    } catch (error) {
      throw error;
    }
  }

  async updateProfile(token: string, updateProfileDto: UpdateProfileDto) {
    console.log('[updateProfile] Entering updateProfile, DTO:', updateProfileDto);
    try {
      console.log('[updateProfile] Validating creator token');
      const isCreator = await this.userService.validate(
        token,
        AccessLevel.CREATOR,
      );
      console.log('[updateProfile] isCreator:', isCreator);
      if (!isCreator.isValid || !isCreator.user || !isCreator.user._id) {
        throw new UnauthorizedException("You're not authorized to perform this action");
      }
      // find creator document
      const creator = await this.creatorModel.findOne({ user: isCreator.user._id }).exec();
      console.log('[updateProfile] Found creator record:', creator);
      if (!creator) {
        throw new NotFoundException('Creator not found');
      }
      // update person firstName and lastName
      await this.personModel.findByIdAndUpdate(
        isCreator.user.person._id,
        { firstName: updateProfileDto.firstName, lastName: updateProfileDto.lastName },
      ).exec();
      // prepare creator fields to update
      const creatorUpdate: Partial<Creator> = {};
      if (updateProfileDto.profession !== undefined) creatorUpdate.profession = updateProfileDto.profession;
      if (updateProfileDto.bio !== undefined) creatorUpdate.bio = updateProfileDto.bio;
      if (updateProfileDto.location !== undefined) creatorUpdate.location = updateProfileDto.location;
      if (updateProfileDto.interests !== undefined) creatorUpdate.interests = updateProfileDto.interests;
      if (updateProfileDto.instagram !== undefined) creatorUpdate.instagram = updateProfileDto.instagram;
      if (updateProfileDto.facebook !== undefined) creatorUpdate.facebook = updateProfileDto.facebook;
      if (updateProfileDto.linkedin !== undefined) creatorUpdate.linkedin = updateProfileDto.linkedin;
      console.log('[updateProfile] creatorUpdate payload:', creatorUpdate);
      // update creator document
      const updatedCreator = await this.creatorModel
        .findByIdAndUpdate(creator._id, creatorUpdate, { new: true })
        .populate({ path: 'user', populate: 'person' })
        .exec();
      console.log('[updateProfile] updatedCreator:', updatedCreator);
      if (!updatedCreator) {
        throw new InternalServerErrorException('Failed to update creator profile');
      }
      return updatedCreator;
    } catch (error) {
      console.error('[updateProfile] Error in updateProfile:', error);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException((error as Error).message || 'Error updating profile');
    }
  }

  private async validateCreator(token: string) {
    const isCreator = await this.userService.validate(
      token,
      AccessLevel.CREATOR,
    );
    return isCreator;
  }

  // Add userId-based helper methods
  async getProfileByUserId(userId: string): Promise<Creator | null> {
    const creator = await this.creatorModel.findOne({ user: userId }).populate('user').exec();
    if (!creator) {
      throw new NotFoundException(`Creator with user ID ${userId} not found`);
    }
    return creator;
  }

  async uploadProfilePictureByUserId(
    userId: string,
    profilePicture: Express.Multer.File,
  ) {
    const { status, url } = await this.mediaService.uploadMedia(
      '/creators/profile/avatar/',
      profilePicture,
    );
    if (!status) {
      throw new InternalServerErrorException(
        'Unable to upload profile picture',
      );
    }
    const creator = await this.creatorModel.findOne({ user: userId }).exec();
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }
    await this.personModel
      .findByIdAndUpdate(creator.user.person, { profilePicture: url })
      .exec();
    return {
      message: 'Profile picture uploaded successfully',
      data: url,
    };
  }

  async changePasswordByUserId(
    userId: string,
    updatePasswordDto: UpdatePasswordDto,
  ) {
    const creator = await this.creatorModel
      .findOne({ user: userId })
      .populate('user')
      .exec();
    if (!creator) {
      throw new NotFoundException('Creator not found');
    }
    const user = creator.user as UserDocument;
    if (!user.password) {
      throw new UnauthorizedException('Password is required');
    }
    if (
      !updatePasswordDto.currentPassword ||
      !(await bcrypt.compare(
        updatePasswordDto.currentPassword,
        user.password,
      ))
    ) {
      throw new UnauthorizedException('Old password is incorrect');
    }
    const hashed = await bcrypt.hash(updatePasswordDto.newPassword, 10);
    await this.userModel
      .findByIdAndUpdate(user._id, { password: hashed })
      .exec();
    return { message: 'Password updated successfully' };
  }

  async updateProfileByUserId(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ) {
    const creator = await this.creatorModel.findOne({ user: userId }).exec();
    if (!creator) {
        throw new NotFoundException('Creator not found');
    }
    
    // Update name
    await this.personModel
        .findByIdAndUpdate(creator.user.person, {
            firstName: updateProfileDto.firstName,
            lastName: updateProfileDto.lastName,
        })
        .exec();
    
    // Prepare other updates
    const update: Partial<CreatorDocument> = {};
    if (updateProfileDto.bio !== undefined) update.bio = updateProfileDto.bio;
    if (updateProfileDto.location !== undefined) update.location = updateProfileDto.location;
    if (updateProfileDto.profession !== undefined) update.profession = updateProfileDto.profession;
    if (updateProfileDto.interests !== undefined) update.interests = updateProfileDto.interests;
    if (updateProfileDto.instagram !== undefined) update.instagram = updateProfileDto.instagram;
    if (updateProfileDto.facebook !== undefined) update.facebook = updateProfileDto.facebook;
    if (updateProfileDto.linkedin !== undefined) update.linkedin = updateProfileDto.linkedin;

    const updated = await this.creatorModel
        .findByIdAndUpdate(creator._id, update, { new: true })
        .populate({ path: 'user', populate: 'person' })
        .exec();

    if (!updated) {
        throw new InternalServerErrorException('Failed to update creator profile');
    }

    // Construct the response object to include all necessary fields
    return {
        _id: updated._id,
        email: updated.user.email,
        person: {
            firstName: updated.user.person.firstName,
            lastName: updated.user.person.lastName,
        },
        bio: updated.bio,
        profession: updated.profession,
        location: updated.location,
        interests: updated.interests,
        instagram: updated.instagram,
        facebook: updated.facebook,
        linkedin: updated.linkedin,
        roles: updated.user.roles, // Assuming roles are part of the user object
    };
  }
}
