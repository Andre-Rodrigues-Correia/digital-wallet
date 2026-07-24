import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Wallet } from '../../wallet/schemas/wallet.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class User {
  @Prop({
    required: true,
    trim: true,
  })
  name: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  })
  email: string;

  @Prop({
    required: true,
    select: false,
  })
  password: string;

  @Prop({
    required: true,
    unique: true,
  })
  accountNumber: string;

  @Prop({
    type: Types.ObjectId,
    ref: Wallet.name,
    required: true,
  })
  walletId: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);
