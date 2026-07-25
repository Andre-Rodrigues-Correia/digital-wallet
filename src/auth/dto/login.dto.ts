import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @IsEmail()
  @ApiProperty({
    example: 'andre@email.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    example: 'Password123',
  })
  password: string;
}
