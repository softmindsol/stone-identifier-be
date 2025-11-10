import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Gem, GemDocument } from '../gems/entities/gem.entity';
import { AiStone, AiStoneDocument } from './entities/ai-stone.entity';
import { GeminiService } from '../common/services/gemini.service';

@Injectable()
export class EmbeddingCronService {
  private readonly logger = new Logger(EmbeddingCronService.name);
  private isProcessing = false;

  constructor(
    @InjectModel(Gem.name)
    private gemModel: Model<GemDocument>,
    @InjectModel(AiStone.name)
    private aiStoneModel: Model<AiStoneDocument>,
    private geminiService: GeminiService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  // Run every day at 1:52 AM Pakistani time (20:52 UTC)
//   @Cron('52 20 * * *', {
//     name: 'generateEmbeddings',
//     timeZone: 'UTC',
//   })
  async handleGenerateEmbeddings() {
    if (this.isProcessing) {
      this.logger.warn('Embedding generation already in progress, skipping...');
      return;
    }

    this.logger.log('Starting automatic embedding generation for all gems');
    await this.generateEmbeddingsForAllGems();
  }

  async generateEmbeddingsForAllGems(): Promise<{
    processed: number;
    created: number;
    updated: number;
    errors: number;
    skipped: number;
  }> {
    this.isProcessing = true;
    const stats = {
      processed: 0,
      created: 0,
      updated: 0,
      errors: 0,
      skipped: 0,
    };

    try {
      this.logger.log('Fetching all gems from database...');
      
      // Get all gems in batches to avoid memory issues
      const batchSize = 10;
      let skip = 0;
      let hasMore = true;

      while (hasMore) {
        const gems = await this.gemModel
          .find({})
          .skip(skip)
          .limit(batchSize)
          .exec();

        if (gems.length === 0) {
          hasMore = false;
          break;
        }

        this.logger.log(`Processing batch: ${skip + 1} to ${skip + gems.length}`);

        for (const gem of gems) {
          try {
            stats.processed++;
            
            // Check if embedding already exists
            const existingEmbedding = await this.aiStoneModel.findOne({
              stone_id: gem._id,
            });

            // Generate searchable text for the gem
            const searchableText = this.generateSearchableText(gem);
            
            if (!existingEmbedding) {
              this.logger.log(`Creating new embedding for: ${gem.stone_name}`);
              
              // Generate embedding using Gemini
              const embeddingVector = await this.geminiService.generateEmbedding(searchableText);
              
              // Create new embedding record
              const newEmbedding = new this.aiStoneModel({
                stone_id: gem._id,
                stone_name: gem.stone_name,
                embedding_text: searchableText,
                embedding_vector: embeddingVector,
                source_model: 'text-embedding-004',
                timestamp: new Date(),
              });

              await newEmbedding.save();
              stats.created++;
              this.logger.log(`Created embedding for: ${gem.stone_name} with ${embeddingVector.length} dimensions`);
            }

            // Add small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));

          } catch (error) {
            stats.errors++;
            this.logger.error(`Error processing gem ${gem.stone_name}:`, error.message);
          }
        }

        skip += batchSize;
        
        // Add delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      this.logger.log('Embedding generation completed', stats);
      return stats;

    } catch (error) {
      this.logger.error('Error in embedding generation cron job:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  async generateEmbeddingForSingleGem(gemId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const gem = await this.gemModel.findById(gemId);
      if (!gem) {
        return {
          success: false,
          message: `Gem with ID ${gemId} not found`
        };
      }

      // Check if embedding already exists
      const existingEmbedding = await this.aiStoneModel.findOne({
        stone_id: new Types.ObjectId(gemId),
      });

      // Generate searchable text for the gem
      const searchableText = this.generateSearchableText(gem);

      if (existingEmbedding) {
        // Generate new embedding vector
        const embeddingVector = await this.geminiService.generateEmbedding(searchableText);
        
        // Update existing embedding
        existingEmbedding.embedding_text = searchableText;
        existingEmbedding.embedding_vector = embeddingVector;
        existingEmbedding.timestamp = new Date();
        await existingEmbedding.save();

        return {
          success: true,
          message: `Updated embedding for ${gem.stone_name} with ${embeddingVector.length} dimensions`
        };
      } else {
        // Generate embedding using Gemini
        const embeddingVector = await this.geminiService.generateEmbedding(searchableText);
        
        // Create new embedding
        const newEmbedding = new this.aiStoneModel({
          stone_id: gem._id,
          stone_name: gem.stone_name,
          embedding_text: searchableText,
          embedding_vector: embeddingVector,
          source_model: 'text-embedding-004',
          timestamp: new Date(),
        });

        await newEmbedding.save();

        return {
          success: true,
          message: `Created embedding for ${gem.stone_name} with ${embeddingVector.length} dimensions`
        };
      }

    } catch (error) {
      this.logger.error(`Error generating embedding for gem ${gemId}:`, error);
      return {
        success: false,
        message: `Error: ${error.message}`
      };
    }
  }

  private generateSearchableText(gem: GemDocument): string {
    // Combine various gem properties into searchable text
    const searchableFields = [
      gem.stone_name,
      gem.variety_of,
      ...(gem.known_as || []),
      ...(gem.tags?.map(tag => tag.name) || []),
      gem.sections?.overview?.description,
      gem.sections?.overview?.quick_facts?.Color,
      gem.sections?.overview?.quick_facts?.['Crystal System'],
      gem.sections?.overview?.quick_facts?.Classification,
      gem.sections?.overview?.quick_facts?.['Primary Uses'],
      gem.sections?.overview?.rarity?.label,
      gem.sections?.overview?.rarity?.description,
      ...(gem.sections?.properties?.healing_properties || []),
      ...(gem.sections?.properties?.qualities?.map(q => q.name) || []),
      ...(gem.sections?.geographical_occurrence?.locations?.map(l => `${l.country} ${l.region}`) || []),
    ];

    return searchableFields
      .filter(field => field && typeof field === 'string')
      .join(' ')
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
