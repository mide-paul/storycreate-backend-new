import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString, IsEnum, IsNotEmpty, IsUrl, ArrayNotEmpty, IsArray } from 'class-validator';
import { Gender } from '../../core/enums';
import { Transform } from 'class-transformer';

export class UpdateUserProfileDto {
  @ApiProperty({ description: 'First name of the user', example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'Last name of the user', example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'Profession of the creator', example: 'Writer', required: false })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiProperty({ description: 'Bio of the creator', example: 'I write stories', required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'Location of the creator', example: 'New York, USA', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: 'Interests of the creator', example: ['writing', 'reading'], required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  interests?: string[];

  @ApiProperty({ description: 'Instagram profile URL', example: 'https://instagram.com/johndoe', required: false })
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  @IsUrl()
  instagram?: string;

  @ApiProperty({ description: 'Facebook profile URL', example: 'https://facebook.com/johndoe', required: false })
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  @IsUrl()
  facebook?: string;

  @ApiProperty({ description: 'LinkedIn profile URL', example: 'https://linkedin.com/in/johndoe', required: false })
  @Transform(({ value }) => value === '' ? undefined : value)
  @IsOptional()
  @IsUrl()
  linkedin?: string;

  @IsOptional() @IsString()    otherName?: string;
  @IsOptional() @IsDateString() dateOfBirth?: string;
  @IsOptional() @IsEnum(Gender) gender?: Gender;
  @IsOptional() @IsString()    profilePicture?: string;
  
} 