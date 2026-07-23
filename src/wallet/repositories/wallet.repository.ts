import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    Wallet,
    WalletDocument,
} from '../schemas/wallet.schema';
import {
    ClientSession,
    Model,
} from 'mongoose';
import { IWalletRepository } from './interfaces/wallet.repository.interface';

@Injectable()
export class WalletRepository implements IWalletRepository {
    constructor(
        @InjectModel(Wallet.name)
        private readonly walletModel: Model<WalletDocument>,
    ) {}

    async create(
        wallet: Partial<Wallet>,
        session?: ClientSession,
    ): Promise<WalletDocument> {
        const [created] = await this.walletModel.create([wallet], {
            session,
        });

        return created;
    }

    async findByUserId(userId: string) {
        return this.walletModel.findOne({
            userId,
        });
    }

    async save(
        wallet: WalletDocument,
        session?: ClientSession,
    ) {
        return wallet.save({ session });
    }
}