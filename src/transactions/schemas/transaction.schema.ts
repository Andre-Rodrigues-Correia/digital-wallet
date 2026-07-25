import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

import { TransactionStatus } from '../enums/transaction-status.enum';
import { TransactionType } from '../enums/transaction-type.enum';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema({
  timestamps: true,
  versionKey: false,
})
export class Transaction {
  _id: Types.ObjectId;

  @Prop({
    type: String,
    enum: TransactionType,
    required: true,
  })
  type: TransactionType;

  @Prop({
    type: String,
    enum: TransactionStatus,
    default: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @Prop({
    required: true,
    min: 0.01,
  })
  amount: number;

  @Prop()
  description?: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Wallet',
    default: null,
  })
  senderWalletId: Types.ObjectId | null;

  @Prop({
    type: Types.ObjectId,
    ref: 'Wallet',
    required: true,
  })
  receiverWalletId: Types.ObjectId;

  @Prop({
    type: Date,
    default: null,
  })
  reversedAt: Date | null;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    default: null,
  })
  reversedBy?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: Transaction.name,
    default: null,
  })
  originalTransactionId?: Types.ObjectId;

  @Prop({
    type: Date,
    default: Date.now,
  })
  createdAt: Date;

  @Prop({
    type: Date,
    default: null,
  })
  updatedAt: Date | null;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
