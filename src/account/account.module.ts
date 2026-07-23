import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Counter, CounterSchema } from './schemas/counter.schema';
import { CounterRepository } from './repositories/counter.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Counter.name,
        schema: CounterSchema,
      },
    ]),
  ],
  providers: [AccountService, CounterRepository],
  exports: [
    CounterRepository, AccountService
  ],
})
export class AccountModule {}
