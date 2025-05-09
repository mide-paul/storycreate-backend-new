import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LikePostDto {
  @ApiProperty({ description: 'User ID who likes the post' })
  @IsString()
  userId: string;
}
