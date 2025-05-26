import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty({ description: 'Author full name of the post' })
  @IsString()
  author: string;

  @ApiProperty({ description: 'Text content of the post' })
  @IsString()
  text: string;

  @ApiProperty({ description: 'Optional image URL for the post', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ description: 'Optional user ID of the post author', required: false })
  @IsOptional()
  @IsString()
  userId?: string;
}
