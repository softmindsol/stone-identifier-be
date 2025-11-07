import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Req,
  BadRequestException
} from '@nestjs/common';
import { SuggestionsService } from './suggestions.service';
import { 
  CreateGemstoneFeedbackDto,
  CreateAppSuggestionDto,
  SuggestionResponseDto
} from './dto/suggestion.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('suggestions')
@UseGuards(JwtAuthGuard)
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Post('gemstone-feedback')
  async submitGemstoneFeedback(
    @Body() feedbackDto: CreateGemstoneFeedbackDto,
    @Req() req: any,
  ): Promise<SuggestionResponseDto> {
    try {
      return await this.suggestionsService.createGemstoneFeedback(req.user.id, feedbackDto);
    } catch (error) {
      throw new BadRequestException('Failed to submit gemstone feedback: ' + error.message);
    }
  }

  @Post('app-suggestion')
  async submitAppSuggestion(
    @Body() suggestionDto: CreateAppSuggestionDto,
    @Req() req: any,
  ): Promise<SuggestionResponseDto> {
    try {
      return await this.suggestionsService.createAppSuggestion(req.user.id, suggestionDto);
    } catch (error) {
      throw new BadRequestException('Failed to submit app suggestion: ' + error.message);
    }
  }
}