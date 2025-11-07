import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';

export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  APPLE = 'apple',
}

export enum SubscriptionType {
  FREE = 'free',
  MONTHLY = 'monthly',
}

export type UserDocument = User & Document & {
  comparePassword(password: string): Promise<boolean>;
};

@Schema({ 
  timestamps: true
})
export class User {
  _id: Types.ObjectId;
  
  id: string;

  @Prop({ required: true, maxlength: 255 })
  name: string;

  @Prop({ required: true, unique: true, maxlength: 255 })
  email: string;

  @Prop({ maxlength: 255 })
  passwordHash?: string;

  @Prop({ 
    type: String, 
    enum: Object.values(AuthProvider), 
    default: AuthProvider.EMAIL 
  })
  provider: AuthProvider;

  @Prop({ default: true })
  verified: boolean;

  @Prop({ maxlength: 255 })
  googleId?: string;

  @Prop({ maxlength: 255 })
  appleId?: string;

  @Prop({ maxlength: 255 })
  profileImageUrl?: string;

  @Prop({ default: null })
  dateOfBirth?: Date;

  @Prop({ maxlength: 255, default: null })
  location?: string;

  @Prop({ maxlength: 512 })
  resetToken?: string;

  @Prop()
  resetTokenExpires?: Date;

  @Prop({ 
    type: String, 
    enum: Object.values(SubscriptionType), 
    default: SubscriptionType.FREE 
  })
  subscription_type: SubscriptionType;

  // Timestamps are automatically handled by Mongoose
  createdAt?: Date;
  updatedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hash password before saving
UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  
  // Only hash if passwordHash is provided and not already hashed
  if (this.passwordHash && !this.passwordHash.startsWith('$2b$')) {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

// Helper method for password validation
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(password, this.passwordHash);
};
