import { Test, TestingModule } from '@nestjs/testing';

import { AccountService } from './account.service';
import { CounterRepository } from './repositories/counter.repository';

describe('AccountService', () => {
  let service: AccountService;

  const counterRepository = {
    increment: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        { provide: CounterRepository, useValue: counterRepository },
      ],
    }).compile();

    service = module.get(AccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate a zero-padded account number', async () => {
    counterRepository.increment.mockResolvedValue({ sequence: 1 });

    const result = await service.generateAccountNumber();

    expect(result).toBe('000001');
    expect(counterRepository.increment).toHaveBeenCalledWith('account');
  });

  it('should pad account number to 6 digits', async () => {
    counterRepository.increment.mockResolvedValue({ sequence: 42 });

    const result = await service.generateAccountNumber();

    expect(result).toBe('000042');
  });

  it('should handle large counter values', async () => {
    counterRepository.increment.mockResolvedValue({ sequence: 999999 });

    const result = await service.generateAccountNumber();

    expect(result).toBe('999999');
  });

  it('should always return a 6-character string', async () => {
    counterRepository.increment.mockResolvedValue({ sequence: 1 });

    const result = await service.generateAccountNumber();

    expect(result.length).toBe(6);
  });
});
