import { ClientSession } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';

export interface IUserRepository {
    create(
        user: Partial<User>,
        session?: ClientSession,
    ): Promise<UserDocument>;

    findById(id: string): Promise<UserDocument | null>;

    findByEmail(email: string): Promise<UserDocument | null>;

    findByAccountNumber(accountNumber: string): Promise<UserDocument | null>;
}