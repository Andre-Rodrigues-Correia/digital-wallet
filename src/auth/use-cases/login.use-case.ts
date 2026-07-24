import { Injectable, UnauthorizedException } from '@nestjs/common';
import { LoginDto } from '../dto/login.dto';
import { UserRepository } from '../../users/repositories/user.repository';
import { PasswordService } from '../../common/security/password.service';
import { AuthService } from '../auth.service';
@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordService: PasswordService,
    private readonly authService: AuthService,
  ) {}
  async execute(dto: LoginDto) {
    const user = await this.userRepository.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    const passwordMatches = await this.passwordService.compare(
      dto.password,
      user.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials.');
    }
    return this.authService.authenticate(user);
  }
}
