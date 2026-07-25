import { ApiProperty } from '@nestjs/swagger';

export class TransferResponseDto {
  @ApiProperty({
    example: 'Transfer completed successfully.',
  })
  message: string;

  @ApiProperty({
    example: 350,
  })
  balance: number;

  @ApiProperty({
    example: '6882cf41b34...',
  })
  transactionId: string;
}
