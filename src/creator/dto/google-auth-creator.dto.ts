import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class GoogleAuthCreatorDto {
  @ApiProperty({
    description: "ID token from Google provider",
    example: "<GOOGLE_AUTH_PROVIDER_ACCESS_TOKEN>",
  })
  @IsNotEmpty()
  @IsString()
  token: string;
}
