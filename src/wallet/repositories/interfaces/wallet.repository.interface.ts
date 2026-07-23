import { ClientSession } from 'mongoose';
import {
    Wallet,
    WalletDocument,
} from '../../schemas/wallet.schema';

export interface IWalletRepository {
    create(
        wallet: Partial<Wallet>,
        session?: ClientSession,
    ): Promise<WalletDocument>;

    findByUserId(
        userId: string,
    ): Promise<WalletDocument | null>;

    save(
        wallet: WalletDocument,
        session?: ClientSession,
    ): Promise<WalletDocument>;
}