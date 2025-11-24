import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SuggestionDocument = Suggestion & Document;

export enum SuggestionType {
  LIKE_CONTENT = 'like_content',
  ERROR_IN_CONTENT = 'error_in_content',
  SUGGESTIONS = 'suggestions',
  INCORRECT_IDENTIFICATION = 'incorrect_identification',
  APP_SUGGESTION = 'app_suggestion'
}

export enum SuggestionStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
  REJECTED = 'rejected'
}

@Schema({ 
  timestamps: true,
  collection: 'suggestions'
})
export class Suggestion {
  _id: Types.ObjectId;
  
  id: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  // Optional for app suggestions, required for gemstone suggestions
  @Prop({ type: Types.ObjectId, ref: 'Gem' })
  gemstoneRef?: Types.ObjectId;

  @Prop({ 
    required: true, 
    enum: Object.values(SuggestionType),
    type: String 
  })
  type: SuggestionType;

  @Prop({ 
    enum: Object.values(SuggestionStatus),
    type: String,
    default: SuggestionStatus.PENDING 
  })
  status: SuggestionStatus;

  @Prop({ maxlength: 1000 })
  content?: string;


  // User's email for contact (especially for app suggestions)
  @Prop({ maxlength: 255 })
  userEmail?: string;

  // Photos/attachments (URLs to uploaded images)
  @Prop({ type: [String], default: [] })
  photos?: string[];

  // Additional context or details
  @Prop({ type: [String], default: [] })
  tags?: string[];

  // Admin response
  @Prop({ maxlength: 1000 })
  adminResponse?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  reviewedBy?: Types.ObjectId;

  @Prop()
  reviewedAt?: Date;

  // Timestamps are automatically handled by Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

export const SuggestionSchema = SchemaFactory.createForClass(Suggestion);