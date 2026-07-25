import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model, Types } from 'mongoose';

import {
  Transaction,
  TransactionDocument,
} from '../schemas/transaction.schema';

@Injectable()
export class TransactionRepository {
  constructor(
    @InjectModel(Transaction.name)
    private readonly transactionModel: Model<TransactionDocument>,
  ) {}

  async create(
    transaction: Partial<Transaction>,
  ): Promise<TransactionDocument> {
    return this.transactionModel.create(transaction);
  }

  async findById(id: string): Promise<TransactionDocument | null> {
    return this.transactionModel.findById(id).exec();
  }

  async findByWallet(walletId: string): Promise<TransactionDocument[]> {
    const objectId = new Types.ObjectId(walletId);

    return this.transactionModel
      .find({
        $or: [
          {
            senderWalletId: objectId,
          },
          {
            receiverWalletId: objectId,
          },
        ],
      })
      .sort({
        createdAt: -1,
      })
      .exec();
  }

  async save(transaction: TransactionDocument): Promise<TransactionDocument> {
    return transaction.save();
  }
}
