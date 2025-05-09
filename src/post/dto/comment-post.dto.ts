import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CommentPostDto {
  @ApiProperty({ description: 'User ID who comments on the post' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Text content of the comment' })
  @IsString()
  text: string;
}
