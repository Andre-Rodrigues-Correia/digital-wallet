import { Injectable } from '@nestjs/common';
import { CounterRepository } from './repositories/counter.repository';
import {
    ACCOUNT_COUNTER,
    ACCOUNT_NUMBER_LENGTH,
} from '../common/constants/account.constants';

@Injectable()
export class AccountService {
    constructor(
        private readonly counterRepository: CounterRepository,
    ) {}

    async generateAccountNumber(): Promise<string> {
        const counter = await this.counterRepository.getNextSequence(
            ACCOUNT_COUNTER,
        );

        return counter.sequence
            .toString()
            .padStart(ACCOUNT_NUMBER_LENGTH, '0');
    }
}