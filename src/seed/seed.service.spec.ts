import { Test, TestingModule } from '@nestjs/testing';
import { SeedService } from './seed.service';
import { UserRepository } from '../users/repositories/user.repository';
import { WalletRepository } from '../wallet/repositories/wallet.repository';
import { PasswordService } from '../common/security/password.service';

describe('SeedService', () => {
  let service: SeedService;

  const userRepository = {
    findByEmail: jest.fn(),
    create: jest.fn(),
  };

  const walletRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const passwordService = {
    hash: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeedService,
        { provide: UserRepository, useValue: userRepository },
        { provide: WalletRepository, useValue: walletRepository },
        { provide: PasswordService, useValue: passwordService },
      ],
    }).compile();

    service = module.get<SeedService>(SeedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
