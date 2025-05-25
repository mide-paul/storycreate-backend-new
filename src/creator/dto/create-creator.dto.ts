import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
  Matches,
  IsOptional,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class ProfileDto {
  @ApiProperty({ description: "Bio of the creator", example: "I am a content creator" })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: "Interests of the creator", example: ["Writing", "Art"] })
  @IsOptional()
  interests?: string[];

  @ApiProperty({ description: "Profession of the creator", example: "Creative Writer" })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiProperty({ description: "Location of the creator", example: "New York" })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: "Instagram URL", example: "https://instagram.com/sampleuser" })
  @IsOptional()
  @IsString()
  instagram?: string;

  @ApiProperty({ description: "Facebook URL", example: "https://facebook.com/sampleuser" })
  @IsOptional()
  @IsString()
  facebook?: string;

  @ApiProperty({ description: "LinkedIn URL", example: "https://linkedin.com/in/sampleuser" })
  @IsOptional()
  @IsString()
  linkedin?: string;
}

export class CreateCreatorDto {
  @ApiProperty({
    description: "Full name of the creator",
    example: "John Doe",
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: "Username of the creator",
    example: "johndoe",
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({
    description: "Bio of the creator",
    example: "I am a content creator",
  })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({
    description: "Email of the user",
    example: "john@storycreate.com",
  })
  @IsNotEmpty()
  @IsEmail()
  @IsString()
  email: string;

  @ApiProperty({
    description: "Password of the user",
    example: "Password@123",
  })
  @IsNotEmpty()
  @IsStrongPassword()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: "Confirm password of the user",
    example: "Password@123",
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/, {
    message: 'Passwords do not match'
  })
  confirmPassword: string;

  @ApiProperty({
    description: "ID upload URL",
    example: "https://example.com/id.jpg",
  })
  @IsOptional()
  @IsString()
  idUploadUrl?: string;

  @ApiProperty({
    description: "Profile data",
    type: ProfileDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProfileDto)
  profile?: ProfileDto;
}
