import { Injectable } from '@nestjs/common';
import { ClientSession, Connection } from 'mongoose';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class TransactionService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}

  async execute<T>(
    callback: (session: ClientSession) => Promise<T>,
  ): Promise<T> {
    const session = await this.connection.startSession();

    try {
      let result!: T;

      await session.withTransaction(async () => {
        result = await callback(session);
      });

      return result;
    } finally {
      await session.endSession();
    }
  }
}
