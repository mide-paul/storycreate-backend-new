import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BankAccount, BankAccountDocument } from '../schemas/bank_account.schema';
import { CreateBankAccountDto } from './dto/create-bank_account.dto';
import { UpdateBankAccountDto } from './dto/update-bank_account.dto';

@Injectable()
export class BankAccountService {
  constructor(
    @InjectModel(BankAccount.name) private bankAccountModel: Model<BankAccountDocument>,
  ) {}

  async create(createBankAccountDto: CreateBankAccountDto): Promise<BankAccountDocument> {
    const createdBankAccount = new this.bankAccountModel(createBankAccountDto);
    return createdBankAccount.save();
  }

  async findAll(): Promise<BankAccountDocument[]> {
    return this.bankAccountModel.find().exec();
  }

  async findOne(id: string): Promise<BankAccountDocument> {
    const bankAccount = await this.bankAccountModel.findById(id).exec();
    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }
    return bankAccount;
  }

  async findByUserId(userId: string): Promise<BankAccountDocument[]> {
    return this.bankAccountModel.find({ user: userId }).exec();
  }

  async update(id: string, updateBankAccountDto: UpdateBankAccountDto): Promise<BankAccountDocument> {
    const bankAccount = await this.bankAccountModel.findByIdAndUpdate(id, updateBankAccountDto, { new: true }).exec();
    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }
    return bankAccount;
  }

  async remove(id: string): Promise<BankAccountDocument> {
    const bankAccount = await this.bankAccountModel.findByIdAndDelete(id).exec();
    if (!bankAccount) {
      throw new NotFoundException(`Bank account with ID ${id} not found`);
    }
    return bankAccount;
  }
} 