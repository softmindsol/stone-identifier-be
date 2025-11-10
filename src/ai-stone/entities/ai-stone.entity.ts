import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AiStoneDocument = AiStone & Document;

@Schema({ 
  timestamps: true,
  collection: 'ai_stone_embeddings'
})
export class AiStone {
  _id: Types.ObjectId;
  
  id: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Gem' })
  stone_id: Types.ObjectId;

  @Prop({ required: true, maxlength: 255 })
  stone_name: string;

  @Prop({ required: true, type: String })
  embedding_text: string;

  @Prop({ type: [Number], required: true })
  embedding_vector: number[];

  @Prop({ required: true, maxlength: 100 })
  source_model: string;

  @Prop({ required: true, default: Date.now })
  timestamp: Date;
}

export const AiStoneSchema = SchemaFactory.createForClass(AiStone);