import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Wallet, WalletDocument } from '../schemas/wallet.schema';

@Injectable()
export class WalletRepository {
  constructor(
    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,
  ) {}

  async create(): Promise<WalletDocument> {
    return this.walletModel.create({
      balance: 0,
    });
  }

  async findById(id: string): Promise<WalletDocument | null> {
    return this.walletModel.findById(id).exec();
  }

  async updateBalance(
    id: string,
    balance: number,
  ): Promise<WalletDocument | null> {
    return this.walletModel
      .findByIdAndUpdate(
        id,
        {
          balance,
        },
        {
          returnDocument: 'after',
        },
      )
      .exec();
  }

  async save(wallet: WalletDocument): Promise<WalletDocument> {
    return wallet.save();
  }
}