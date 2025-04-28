import { IsNotEmpty, IsPositive, IsString } from "class-validator";

export class ValidationDto {
  @IsPositive()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsNotEmpty()
  email: string;
}
