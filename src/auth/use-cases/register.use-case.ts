import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterDto } from '../dto/register.dto';
import { AuthService } from '../auth.service';
import { UserRepository } from '../../users/repositories/user.repository';
import { WalletRepository } from '../../wallet/repositories/wallet.repository';
import { AccountService } from '../../account/account.service';
import { PasswordService } from '../../common/security/password.service';
import { TransactionService } from '../../common/database/transaction.service';
@Injectable()
export class RegisterUseCase {
  constructor(
    private readonly transaction: TransactionService,
    private readonly userRepository: UserRepository,
    private readonly walletRepository: WalletRepository,
    private readonly accountService: AccountService,
    private readonly passwordService: PasswordService,
    private readonly authService: AuthService,
  ) {}
  async execute(dto: RegisterDto) {
    const emailAlreadyExists = await this.userRepository.findByEmail(dto.email);

    if (emailAlreadyExists) {
      throw new ConflictException('Email already registered.');
    }

    const hashedPassword = await this.passwordService.hash(dto.password);

    const accountNumber = await this.accountService.generateAccountNumber();

    const wallet = await this.walletRepository.create();

    const user = await this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      accountNumber,
      walletId: wallet._id,
    });

    return this.authService.authenticate(user);
  }
}
