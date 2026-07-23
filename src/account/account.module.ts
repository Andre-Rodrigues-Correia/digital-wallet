import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Counter, CounterSchema } from './schemas/counter.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Counter.name,
        schema: CounterSchema,
      },
    ]),
  ],
  providers: [AccountService]
})
export class AccountModule {}
