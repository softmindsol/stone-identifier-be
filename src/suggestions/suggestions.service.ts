import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Suggestion, SuggestionDocument, SuggestionType, SuggestionStatus } from './entities/suggestion.entity';
import { 
  CreateGemstoneFeedbackDto,
  CreateAppSuggestionDto,
  SuggestionResponseDto
} from './dto/suggestion.dto';

@Injectable()
export class SuggestionsService {
  constructor(
    @InjectModel(Suggestion.name)
    private suggestionModel: Model<SuggestionDocument>,
  ) {}

  async createGemstoneFeedback(userId: string, createFeedbackDto: CreateGemstoneFeedbackDto): Promise<SuggestionResponseDto> {
    // Validate required fields based on suggestion type
    if (createFeedbackDto.type === SuggestionType.ERROR_IN_CONTENT && !createFeedbackDto.content) {
      throw new BadRequestException('Content is required for error reports');
    }
    
    if (createFeedbackDto.type === SuggestionType.SUGGESTIONS && !createFeedbackDto.content) {
      throw new BadRequestException('Content is required for suggestions');
    }
    
    if (createFeedbackDto.type === SuggestionType.INCORRECT_IDENTIFICATION && !createFeedbackDto.suggestedIdentification) {
      throw new BadRequestException('Suggested identification is required for incorrect identification reports');
    }

    const suggestion = new this.suggestionModel({
      ...createFeedbackDto,
      userId: new Types.ObjectId(userId),
      gemstoneRef: new Types.ObjectId(createFeedbackDto.gemstoneRef),
    });

    const savedSuggestion = await suggestion.save();
    return this.transformToResponseDto(savedSuggestion);
  }

  async createAppSuggestion(userId: string, createAppSuggestionDto: CreateAppSuggestionDto): Promise<SuggestionResponseDto> {
    const suggestion = new this.suggestionModel({
      ...createAppSuggestionDto,
      userId: new Types.ObjectId(userId),
      type: SuggestionType.APP_SUGGESTION,
    });

    const savedSuggestion = await suggestion.save();
    return this.transformToResponseDto(savedSuggestion);
  }

  async findAllByUser(
    userId: string, 
    page: number = 1, 
    limit: number = 20
  ): Promise<{
    suggestions: SuggestionResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    
    const [suggestions, total] = await Promise.all([
      this.suggestionModel
        .find({ userId: new Types.ObjectId(userId), isActive: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('gemstoneRef', 'stone_name')
        .exec(),
      this.suggestionModel.countDocuments({ userId: new Types.ObjectId(userId), isActive: true })
    ]);

    return {
      suggestions: suggestions.map(suggestion => this.transformToResponseDto(suggestion)),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  private transformToResponseDto(suggestion: SuggestionDocument): SuggestionResponseDto {
    return {
      id: suggestion._id.toString(),
      userId: suggestion.userId.toString(),
      gemstoneRef: suggestion.gemstoneRef?.toString(),
      type: suggestion.type,
      status: suggestion.status,
      content: suggestion.content,
      title: suggestion.title,
      userEmail: suggestion.userEmail,
      errorField: suggestion.errorField,
      suggestedIdentification: suggestion.suggestedIdentification,
      photos: suggestion.photos,
      tags: suggestion.tags,
      adminResponse: suggestion.adminResponse,
      reviewedBy: suggestion.reviewedBy?.toString(),
      reviewedAt: suggestion.reviewedAt,
      createdAt: suggestion.createdAt!,
      updatedAt: suggestion.updatedAt!,
    };
  }
}