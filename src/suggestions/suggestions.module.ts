import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SuggestionsService } from './suggestions.service';
import { SuggestionsController } from './suggestions.controller';
import { Suggestion, SuggestionSchema } from './entities/suggestion.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Suggestion.name, schema: SuggestionSchema }
    ])
  ],
  controllers: [SuggestionsController],
  providers: [SuggestionsService],
  exports: [SuggestionsService],
})
export class SuggestionsModule {}