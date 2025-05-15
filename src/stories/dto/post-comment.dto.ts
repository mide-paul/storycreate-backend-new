import { IsNotEmpty, IsString } from 'class-validator';

export class PostCommentDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsString()
  content: string;
}
