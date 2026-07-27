import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { MeUseCase } from './use-cases/me.use-case';

describe('UsersController', () => {
  let controller: UsersController;

  const meUseCase = { execute: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: MeUseCase, useValue: meUseCase },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
