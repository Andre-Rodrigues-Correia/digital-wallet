import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
    User,
    UserDocument,
} from '../schemas/user.schema';
import {
    ClientSession,
    Model,
} from 'mongoose';
import { IUserRepository } from './interfaces/user.repository.interface';

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
    ) {}

    async create(
        user: Partial<User>,
        session?: ClientSession,
    ): Promise<UserDocument> {
        const [created] = await this.userModel.create([user], {
            session,
        });

        return created;
    }

    async findById(id: string) {
        return this.userModel.findById(id);
    }

    async findByEmail(email: string) {
        return this.userModel.findOne({
            email,
        });
    }

    async findByAccountNumber(accountNumber: string) {
        return this.userModel.findOne({
            accountNumber,
        });
    }
}