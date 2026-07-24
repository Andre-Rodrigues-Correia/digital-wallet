import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Counter, CounterDocument } from '../schemas/counter.schema';

@Injectable()
export class CounterRepository {
  constructor(
    @InjectModel(Counter.name)
    private readonly counterModel: Model<CounterDocument>,
  ) {}

  async increment(counterName: string): Promise<CounterDocument> {
    return this.counterModel.findByIdAndUpdate(
      counterName,
      {
        $inc: {
          sequence: 1,
        },
      },
      {
        upsert: true,
        returnDocument: 'after',
      },
    );
  }
}
