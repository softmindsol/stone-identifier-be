import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { GemsController } from './gems.controller';
import { GemsService } from './gems.service';
import { Gem, GemSchema } from './entities/gem.entity';
import { GeminiService } from '../common/services/gemini.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gem.name, schema: GemSchema }]),
    ConfigModule,
  ],
  controllers: [GemsController],
  providers: [GemsService, GeminiService],
  exports: [GemsService, GeminiService],
})
export class GemsModule {}