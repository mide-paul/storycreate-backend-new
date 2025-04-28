import { PartialType } from '@nestjs/mapped-types';
import { CreateBankAccountDto } from './create-bank_account.dto';
 
export class UpdateBankAccountDto extends PartialType(CreateBankAccountDto) {} 