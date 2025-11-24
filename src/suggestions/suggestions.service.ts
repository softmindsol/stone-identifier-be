import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Suggestion, SuggestionDocument, SuggestionStatus, SuggestionType } from './entities/suggestion.entity';
import { CreateBirdFeedbackDto, CreateAppSuggestionDto } from './dto/create-suggestion.dto';

@Injectable()
export class SuggestionsService {
  constructor(
    @InjectModel(Suggestion.name)
    private suggestionModel: Model<SuggestionDocument>,
  ) {}

  async findAll(): Promise<Suggestion[]> {
    return this.suggestionModel
      .find()
      .sort({ createdAt: -1 })
      .exec();
  }

  async findById(id: string): Promise<Suggestion> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid suggestion ID');
    }

    const suggestion = await this.suggestionModel.findById(id).exec();
    if (!suggestion) {
      throw new NotFoundException(`Suggestion with ID ${id} not found`);
    }
    return suggestion;
  }

  async findByUserId(userId: string): Promise<Suggestion[]> {
    if (!Types.ObjectId.isValid(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.suggestionModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByStatus(status: SuggestionStatus): Promise<Suggestion[]> {
    return this.suggestionModel
      .find({ status })
      .sort({ createdAt: -1 })
      .exec();
  }

  async createBirdFeedback(
    userId: string,
    createDto: CreateBirdFeedbackDto,
  ): Promise<Suggestion> {
    // Validate that type is not APP_SUGGESTION
    if (createDto.type === SuggestionType.APP_SUGGESTION) {
      throw new BadRequestException(
        'APP_SUGGESTION type is not allowed for bird feedback. Use app feedback endpoint instead.',
      );
    }

    const suggestion = new this.suggestionModel({
      userId: new Types.ObjectId(userId),
      birdRef: new Types.ObjectId(createDto.birdRef),
      type: createDto.type,
      content: createDto.content,
      status: SuggestionStatus.PENDING,
    });

    return suggestion.save();
  }

  async createAppFeedback(
    userId: string,
    createDto: CreateAppSuggestionDto,
  ): Promise<Suggestion> {
    const suggestion = new this.suggestionModel({
      userId: new Types.ObjectId(userId),
      type: SuggestionType.APP_SUGGESTION,
      userEmail: createDto.userEmail,
      content: createDto.content,
      photos: createDto.photos || [],
      status: SuggestionStatus.PENDING,
    });

    return suggestion.save();
  }
}
