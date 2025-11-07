import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CollectionDocument = Collection & Document;

@Schema({ _id: false })
export class StoneSize {
  @Prop()
  length?: number;

  @Prop()
  width?: number;

  @Prop()
  height?: number;

  @Prop()
  unit?: string; // 'inch', 'cm', etc.
}

@Schema({ 
  timestamps: true,
  collection: 'collections'
})
export class Collection {
  _id: Types.ObjectId;
  
  id: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @Prop({ required: true, maxlength: 255 })
  name: string;

  @Prop({ maxlength: 100 })
  serialNo?: string;

  @Prop({ type: [String], default: [] })
  photos: string[];

  @Prop()
  acquisitionDate?: Date;

  @Prop()
  acquisitionPrice?: number;

  @Prop({ maxlength: 10, default: 'USD' })
  currency?: string;

  @Prop({ maxlength: 100 })
  locality?: string;

  @Prop({ maxlength: 100 })
  type?: string;

  @Prop({ type: StoneSize })
  stoneSize?: StoneSize;

  @Prop({ maxlength: 1000 })
  notes?: string;

  // Reference to the original gemstone from gems collection (optional)
  @Prop({ type: Types.ObjectId, ref: 'Gem' })
  gemstoneRef?: Types.ObjectId;

  // Store basic gemstone info for quick access
  @Prop({ maxlength: 255 })
  identifiedAs?: string;

  @Prop({ min: 0, max: 1 })
  confidence?: number;

  @Prop({ type: [String], default: [] })
  tags?: string[];

  @Prop({ default: false })
  isWishlisted: boolean;

  @Prop({ default: true })
  isActive: boolean;

  // Timestamps are automatically handled by Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

export const CollectionSchema = SchemaFactory.createForClass(Collection);

// Create indexes for better performance
CollectionSchema.index({ userId: 1 });