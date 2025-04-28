import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { BankAccountService } from './bank_account.service';
import { CreateBankAccountDto } from './dto/create-bank_account.dto';
import { UpdateBankAccountDto } from './dto/update-bank_account.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('bank-accounts')
@Controller('bank-accounts')
export class BankAccountController {
  constructor(private readonly bankAccountService: BankAccountService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new bank account' })
  @ApiResponse({ status: 201, description: 'Bank account created successfully' })
  create(@Body() createBankAccountDto: CreateBankAccountDto) {
    return this.bankAccountService.create(createBankAccountDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all bank accounts' })
  @ApiResponse({ status: 200, description: 'Return all bank accounts' })
  findAll() {
    return this.bankAccountService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bank account by id' })
  @ApiResponse({ status: 200, description: 'Return the bank account' })
  findOne(@Param('id') id: string) {
    return this.bankAccountService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get bank accounts by user id' })
  @ApiResponse({ status: 200, description: 'Return bank accounts for the user' })
  findByUserId(@Param('userId') userId: string) {
    return this.bankAccountService.findByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a bank account' })
  @ApiResponse({ status: 200, description: 'Bank account updated successfully' })
  update(@Param('id') id: string, @Body() updateBankAccountDto: UpdateBankAccountDto) {
    return this.bankAccountService.update(id, updateBankAccountDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bank account' })
  @ApiResponse({ status: 200, description: 'Bank account deleted successfully' })
  remove(@Param('id') id: string) {
    return this.bankAccountService.remove(id);
  }
} 