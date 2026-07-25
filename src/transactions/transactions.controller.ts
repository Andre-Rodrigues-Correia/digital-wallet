// import { Controller } from '@nestjs/common';
// import { ApiTags } from '@nestjs/swagger';
//
// @ApiTags('Transactions')
// @Controller('transactions')
// export class TransactionsController {}
//
//
// // import { Controller } from '@nestjs/common';
// // import { ApiTags } from '@nestjs/swagger';
// //
// // @ApiTags('Transactions')
// // @Controller('transactions')
// // export class TransactionController {}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../common/security/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

import { DepositDto } from './dto/deposit.dto';
import { DepositUseCase } from './use-cases/deposit.use-case';

import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { TransferResponseDto } from './dto/transfer-response.dto';
import { TransferDto } from './dto/transfer.dto';
import { TransferUseCase } from './use-cases/transfer.use-case';
import { ListTransactionsUseCase } from './use-cases/list-transactions.use-case';
import { TransactionHistoryDto } from './dto/transaction-history.dto';
import { ReverseTransactionUseCase } from './use-cases/reverse-transaction.use-case';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(
    private readonly depositUseCase: DepositUseCase,
    private readonly transferUseCase: TransferUseCase,
    private readonly listTransactionsUseCase: ListTransactionsUseCase,
    private readonly reverseTransactionUseCase: ReverseTransactionUseCase,
  ) {}

  @Post('deposit')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Deposit money',
  })
  deposit(@CurrentUser() user: JwtPayload, @Body() dto: DepositDto) {
    return this.depositUseCase.execute(user.sub, dto);
  }

  @Post('transfer')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Transfer money to another account',
    description:
      'Transfers money from the authenticated user to another account.',
  })
  @ApiCreatedResponse({
    type: TransferResponseDto,
  })
  transfer(@CurrentUser() user: JwtPayload, @Body() dto: TransferDto) {
    return this.transferUseCase.execute(user.sub, dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Transaction history',
  })
  @ApiOkResponse({
    type: TransactionHistoryDto,
    isArray: true,
  })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.listTransactionsUseCase.execute(user.sub);
  }

  @Post(':id/reverse')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Reverse transaction',
  })
  reverse(@Param('id') id: string) {
    return this.reverseTransactionUseCase.execute(id);
  }
}
