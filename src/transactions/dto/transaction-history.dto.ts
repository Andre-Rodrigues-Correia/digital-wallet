import { ApiProperty } from '@nestjs/swagger';

export class TransactionHistoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({
    example: 'TRANSFER',
  })
  type: string;

  @ApiProperty({
    example: 'OUT',
  })
  direction: 'IN' | 'OUT';

  @ApiProperty({
    example: 250,
  })
  amount: number;

  @ApiProperty({
    example: 'COMPLETED',
  })
  status: string;

  @ApiProperty({
    example: 'Maria Silva',
    required: false,
  })
  user?: string;

  @ApiProperty({
    example: '10000002',
    required: false,
  })
  accountNumber?: string;

  @ApiProperty()
  createdAt: Date;
}
