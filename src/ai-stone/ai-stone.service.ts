import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AiStone, AiStoneDocument } from './entities/ai-stone.entity';

@Injectable()
export class AiStoneService {
  constructor(
    @InjectModel(AiStone.name)
    private aiStoneModel: Model<AiStoneDocument>,
  ) {}

  // Service methods will be added later when implementing APIs
}