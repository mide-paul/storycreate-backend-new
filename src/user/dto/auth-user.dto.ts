import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class AuthUserDto {
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
  @IsString()
  password: string;
} 