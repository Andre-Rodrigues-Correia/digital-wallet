// import { ApiProperty } from '@nestjs/swagger';
// import { IsNumber, IsPositive, Max } from 'class-validator';
//
// export class DepositDto {
//   @ApiProperty({
//     example: 100,
//   })
//   @IsNumber()
//   @IsPositive()
//   @Max(1000000)
//   amount: number;
// }

import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class DepositDto {
  @ApiProperty({
    example: 250,
    description: 'Valor do depósito.',
    minimum: 1,
  })
  @IsNumber()
  @IsPositive()
  amount: number;
}