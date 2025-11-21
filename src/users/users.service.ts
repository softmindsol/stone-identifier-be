import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, AuthProvider } from './entities/user.entity';

export interface CreateUserDto {
  name: string;
  email: string;
  passwordHash?: string;
  provider: AuthProvider;
  verified?: boolean;
  googleId?: string;
  appleId?: string;
  profileImageUrl?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  passwordHash?: string;
  provider?: AuthProvider;
  verified?: boolean;
  googleId?: string;
  appleId?: string;
  profileImageUrl?: string;
  resetToken?: string | null;
  resetTokenExpires?: Date | null;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    return user.save();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ email }).exec();
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.userModel.findOne({ 
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    }).exec();
  }

    async findByEmailAndResetToken(email: string, token: string): Promise<User | null> {
    return this.userModel.findOne({ 
      email: email,
      resetToken: token
    }).exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Update the document properties
    Object.assign(user, updateUserDto);
    
    // Save the document (this will trigger pre-save hooks)
    return user.save();
  }

  async remove(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
