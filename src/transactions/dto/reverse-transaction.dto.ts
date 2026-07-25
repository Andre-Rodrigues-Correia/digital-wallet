import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';

export class ReverseTransactionDto {
  @ApiProperty()
  @IsMongoId()
  transactionId: string;
}