import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AiStoneService } from './ai-stone.service';
import { EmbeddingCronService } from './embedding-cron.service';
import { EmbeddingController } from './embedding.controller';
import { AiStone, AiStoneSchema } from './entities/ai-stone.entity';
import { Gem, GemSchema } from '../gems/entities/gem.entity';
import { GeminiService } from '../common/services/gemini.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AiStone.name, schema: AiStoneSchema },
      { name: Gem.name, schema: GemSchema }
    ]),
    ScheduleModule.forRoot(),
    ConfigModule,
  ],
  controllers: [ EmbeddingController],
  providers: [AiStoneService, EmbeddingCronService, GeminiService],
  exports: [AiStoneService, EmbeddingCronService],
})
export class AiStoneModule {}