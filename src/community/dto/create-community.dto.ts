import { IsString, IsOptional, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCommunityDto {
  @IsString()
  @MaxLength(100)
  @Type(() => String)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
   @Type(() => String)
  description?: string;
}
