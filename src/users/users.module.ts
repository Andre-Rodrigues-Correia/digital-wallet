import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { UserRepository } from './repositories/user.repository';
import { MeUseCase } from './use-cases/me.use-case';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    WalletModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, UserRepository, MeUseCase],
  exports: [UserRepository],
})
export class UsersModule {}
