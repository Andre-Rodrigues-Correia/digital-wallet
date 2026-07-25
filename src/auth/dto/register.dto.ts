import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  @ApiProperty({
    example: 'André Correia',
  })
  name: string;

  @IsEmail()
  @ApiProperty({
    example: 'andre@email.com',
  })
  email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'Password must contain uppercase, lowercase and number.',
  })
  @ApiProperty({
    example: 'Password123',
  })
  password: string;
}
