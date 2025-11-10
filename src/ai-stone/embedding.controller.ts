import { 
  Controller, 
  Post, 
  Get, 
  Param, 
  UseGuards
} from '@nestjs/common';
import { EmbeddingCronService } from './embedding-cron.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai-stone/embeddings')
@UseGuards(JwtAuthGuard)
export class EmbeddingController {
  constructor(private readonly embeddingCronService: EmbeddingCronService) {}

}