import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { RegisterUseCase } from './use-cases/register.use-case';
import { LoginUseCase } from './use-cases/login.use-case';

describe('AuthController', () => {
  let controller: AuthController;

  const registerUseCase = { execute: jest.fn() };
  const loginUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: RegisterUseCase, useValue: registerUseCase },
        { provide: LoginUseCase, useValue: loginUseCase },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
