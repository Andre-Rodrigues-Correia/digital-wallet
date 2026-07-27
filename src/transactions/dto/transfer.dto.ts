import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsString } from 'class-validator';

export class TransferDto {
  @ApiProperty({
    example: '000002',
    description: 'Destination account number.',
  })
  @IsString()
  accountNumber: string;

  @ApiProperty({
    example: 150,
    description: 'Transfer amount.',
  })
  @IsNumber()
  @IsPositive()
  amount: number;
}
