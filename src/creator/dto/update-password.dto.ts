import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class UpdatePasswordDto {
  @ApiProperty({
    description: "Your current password",
    example: "Password@123",
  })
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @ApiProperty({
    description: "Your new password you want to change to",
    example: "Password@123",
  })
  @IsNotEmpty()
  @IsString()
  newPassword: string;
}
