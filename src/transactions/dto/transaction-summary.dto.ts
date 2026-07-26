import { ApiProperty } from '@nestjs/swagger';

export class TransactionSummaryDto {
  @ApiProperty({
    example: 1500,
  })
  balance: number;

  @ApiProperty({
    example: 3500,
  })
  totalReceived: number;

  @ApiProperty({
    example: 2000,
  })
  totalSent: number;

  @ApiProperty({
    example: 1000,
  })
  totalDeposited: number;

  @ApiProperty({
    example: 1500,
  })
  totalTransferred: number;

  @ApiProperty({
    example: 200,
  })
  totalReversed: number;

  @ApiProperty({
    example: 12,
  })
  totalTransactions: number;
}
