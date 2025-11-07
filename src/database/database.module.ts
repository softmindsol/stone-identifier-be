import { Module, OnModuleInit } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule implements OnModuleInit {
  constructor(@InjectConnection() private connection: Connection) {}

  onModuleInit() {
    this.connection.on('connected', () => {
      console.log('🍃 MongoDB connected successfully');
    });
    
    this.connection.on('disconnected', () => {
      console.log('❌ MongoDB disconnected');
    });
    
    this.connection.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
    });


    if (this.connection.readyState === 1) {
      console.log('🍃 MongoDB connected successfully');
    }
  }
}
