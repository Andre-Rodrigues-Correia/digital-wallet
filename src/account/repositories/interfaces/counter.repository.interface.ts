import { CounterDocument } from '../../schemas/counter.schema';

export interface ICounterRepository {
    getNextSequence(
        counterName: string,
    ): Promise<CounterDocument>;
}