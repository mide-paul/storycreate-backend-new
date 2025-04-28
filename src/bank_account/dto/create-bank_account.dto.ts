import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateBankAccountDto {
  @ApiProperty({
    description: 'Account number',
    example: '1234567890',
  })
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @ApiProperty({
    description: 'Bank name',
    example: 'First Bank',
  })
  @IsNotEmpty()
  @IsString()
  bankName: string;

  @ApiProperty({
    description: 'Account name',
    example: 'John Doe',
  })
  @IsNotEmpty()
  @IsString()
  accountName: string;
} 