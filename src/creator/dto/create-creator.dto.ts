import { ApiProperty } from "@nestjs/swagger";
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsStrongPassword,
  MinLength,
  Matches,
  IsOptional,
} from "class-validator";

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

   // Add the profile field
   @IsOptional()
   profile?: {
     bio?: string;
     interests?: string[];
     profession?: string;
     location?: string;
     instagram?: string;
     facebook?: string;
     linkedin?: string;
   };
}
