import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  Res,
  UseGuards,
  UnauthorizedException,
  HttpStatus,
  NotFoundException,
  InternalServerErrorException,
} from "@nestjs/common";
import { CreatorService } from "./creator.service";
import { CreateCreatorDto } from "./dto/create-creator.dto";
import { UpdateCreatorDto } from "./dto/update-creator.dto";
import { AuthCreatorDto } from "./dto/auth-creator.dto";
import { AuthTokenGuard } from "src/interceptors/validator";
import { ValidationPipe } from '@nestjs/common';
import { GoogleAuthCreatorDto } from "./dto/google-auth-creator.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { Request, Response } from "express";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { Roles } from "src/decorators/roles.decorator";
import { AccessLevel } from "src/core/enums";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { Schema, Document } from 'mongoose';

@Controller("creators")
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) { }

  @Post("auth/login")
  async login(@Body() authCreatorDto: AuthCreatorDto, @Res() res: Response) {
    const authdata = await this.creatorService.login(authCreatorDto);

    // set the token in the cookie
    res.cookie("token", authdata.data.token, {
      httpOnly: true, // If you're accessing cookies client-side, httpOnly should be false
      secure: process.env.NODE_ENV == "production", // Only over HTTPS in production
      sameSite: process.env.NODE_ENV == "production" ? "none" : "lax", // Strict in production, none in development
      path: "/", // Ensure cookie is available throughout the app
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      domain:
        process.env.NODE_ENV == "production"
          ? process.env.COOKIE_DOMAIN
          : undefined, // Use your domain
    });

    return res.send(authdata);
  }

  @Post("auth/signup")
  @UseInterceptors(FileInterceptor('id_upload'))
  async signup(
    @Body(new ValidationPipe({ transform: true, whitelist: true })) createCreatorDto: CreateCreatorDto,
    @UploadedFile() idUpload: Express.Multer.File,
    @Res() res: Response
  ) {
    if (idUpload) {
      createCreatorDto.idUploadUrl = idUpload.path;
    }

    // Add dummy data to the profile
    const dummyProfileData = {
      bio: "No bio added yet.",
      interests: ["Writing", "Art", "Technology"],
      profession: "Creative Writer",
      location: "No location added.",
      instagram: "https://instagram.com/sampleuser",
      facebook: "https://facebook.com/sampleuser",
      linkedin: "https://linkedin.com/in/sampleuser",
    };

    // Create the creator with the provided data and dummy profile data
    const creator = await this.creatorService.create({
      ...createCreatorDto,
      profile: dummyProfileData, // Add dummy profile data
    });

    return res.status(HttpStatus.CREATED).json({
      message: "Creator account created successfully",
      data: {
        id: creator._id,
        email: creator.user.email,
        firstName: creator.user.person.firstName,
        lastName: creator.user.person.lastName,
        profile: dummyProfileData, // Return the dummy profile data
      }
    });
  }

  @Post()
  @UseInterceptors(FileInterceptor('id_upload'))
  create(@Body() createCreatorDto: CreateCreatorDto, @UploadedFile() idUpload: Express.Multer.File) {
    if (idUpload) {
      createCreatorDto.idUploadUrl = idUpload.path;
    }
    return this.creatorService.create(createCreatorDto);
  }

  @Post("auth/with/google")
  async googleAuth(@Body() googleAuthCreatorDto: GoogleAuthCreatorDto) {
    return await this.creatorService.googleAuth(googleAuthCreatorDto);
  }

  @Post("profile/upload/profile-picture")
  @UseInterceptors(AuthTokenGuard)
  @Roles(AccessLevel.USER)
  @UseInterceptors(FileInterceptor("profile-picture"))
  async uploadProfilePicture(
    @Req() req: Request & { user: { id: string } },
    @UploadedFile() profilePicture: Express.Multer.File,
  ) {
    return await this.creatorService.uploadProfilePictureByUserId(req.user.id, profilePicture);
  }

  @Post("profile/password/change")
  @UseInterceptors(AuthTokenGuard)
  async changePassword(
    @Req() req: Request & { user: { id: string } },
    @Body() body: UpdatePasswordDto,
  ) {
    return await this.creatorService.changePasswordByUserId(req.user.id, body);
  }

  @Get("profile")
  @UseInterceptors(AuthTokenGuard)
  async getProfile(
    @Req() req: Request & { user: { id: string } },
  ) {
    const userProfile = await this.creatorService.getProfileByUserId(req.user.id);
    if (!userProfile) {
      throw new NotFoundException("User profile not found");
    }
    return {
      message: "User profile retrieved successfully",
      data: {
        id: userProfile._id,
        email: userProfile.email,
        person: {
          firstName: userProfile.person.firstName,
          lastName: userProfile.person.lastName,
        },
        profile: userProfile.profile,
      },
    };
  }

  @Patch("profile")
  @UseInterceptors(AuthTokenGuard)
  @Roles(AccessLevel.CREATOR)
  async updateProfile(
    @Req() req: Request & { user: { id: string } },
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    const updated = await this.creatorService.updateProfileByUserId(
      req.user.id,
      updateProfileDto,
    );

    // Return the updated profile data directly
    return {
      message: 'Profile updated successfully',
      data: updated, // Return the updated object directly
    };
  }

  @Get(":id([0-9a-fA-F]{24})")
  findOne(@Param("id") id: string) {
    return this.creatorService.findOne(id);
  }

  @Patch(":id([0-9a-fA-F]{24})")
  @UseInterceptors(AuthTokenGuard)
  update(@Param("id") id: string, @Body() updateCreatorDto: UpdateCreatorDto) {
    return this.creatorService.update(id, updateCreatorDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.creatorService.remove(id);
  }
}

export interface Profile {
  bio?: string;
  interests?: string[];
  profession?: string;
  location?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
}

export interface Creator extends Document {
  _id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profile?: Profile; // Ensure this is included
}

const CreatorSchema = new Schema<Creator>({
  email: { type: String, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  profile: {
    bio: { type: String },
    interests: { type: [String] },
    profession: { type: String },
    location: { type: String },
    instagram: { type: String },
    facebook: { type: String },
    linkedin: { type: String },
  },
});
