import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AuthCreatorDto {
  @ApiProperty({
    description: "Identifier of the user (email or username)",
    example: "john@storycreate.com or johndoe",
  })
  @IsNotEmpty()
  @IsString()
  identifier: string;

  @ApiProperty({
    description: "Password of the user",
    example: "Password@123",
  })
  @IsNotEmpty()
  @IsString()
  password: string;
}
