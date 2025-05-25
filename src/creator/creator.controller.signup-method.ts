import { Controller, Post, Body, UploadedFile, Res, UseInterceptors, ValidationPipe } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { Response } from "express";
import { CreateCreatorDto } from "./dto/create-creator.dto";
import { CreatorService } from "./creator.service";

@Controller("creators")
export class CreatorController {
  constructor(private readonly creatorService: CreatorService) {}

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

    return res.status(201).json({
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
}
