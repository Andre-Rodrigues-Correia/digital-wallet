import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({
    timestamps: true,
    versionKey: false,
})
export class Wallet {
    @Prop({
        type: Types.ObjectId,
        ref: 'User',
        unique: true,
        required: true,
    })
    userId: Types.ObjectId;

    @Prop({
        default: 0,
    })
    balance: number;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);