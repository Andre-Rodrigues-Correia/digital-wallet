import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    Counter,
    CounterDocument,
} from '../schemas/counter.schema';
import { Model } from 'mongoose';
import { ICounterRepository } from './interfaces/counter.repository.interface';

@Injectable()
export class CounterRepository implements ICounterRepository {
    constructor(
        @InjectModel(Counter.name)
        private readonly counterModel: Model<CounterDocument>,
    ) {}

    async getNextSequence(
        counterName: string,
    ): Promise<CounterDocument> {
        const counter = await this.counterModel.findByIdAndUpdate(
            counterName,
            {
                $inc: {
                    sequence: 1,
                },
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            },
        );

        if (!counter) {
            throw new Error('Unable to generate account number.');
        }

        return counter;
    }
}