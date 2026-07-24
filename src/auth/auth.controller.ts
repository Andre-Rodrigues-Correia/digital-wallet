import { Body, Controller, Post } from '@nestjs/common';

import { RegisterDto } from './dto/register.dto';
import { RegisterUseCase } from './use-cases/register.use-case';

import { LoginDto } from './dto/login.dto';
import { LoginUseCase } from './use-cases/login.use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.registerUseCase.execute(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }
}
