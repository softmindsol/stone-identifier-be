import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { SuggestionsService } from './suggestions.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateBirdFeedbackDto, CreateAppSuggestionDto } from './dto/create-suggestion.dto';

@Controller('suggestions')
@UseGuards(JwtAuthGuard)
export class SuggestionsController {
  constructor(private readonly suggestionsService: SuggestionsService) {}

  @Post('gem-feedback')
  async createBirdFeedback(
    @Request() req,
    @Body() createDto: CreateBirdFeedbackDto,
  ) {
    const userId = req.user._id.toString();
    return await this.suggestionsService.createBirdFeedback(
      userId,
      createDto,
    );
  }

  @Post('app-feedback')
  @UseInterceptors(FilesInterceptor('photos', 5, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB per file
    },
  }))
  async createAppFeedback(
    @Request() req,
    @Body() createDto: CreateAppSuggestionDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const userId = req.user._id.toString();
    
    // For now, we'll store file info as strings
    // In production, you'd upload these to cloud storage (S3, Cloudinary, etc.)
    const photoUrls = files?.map(file => file.originalname) || [];
    
    return await this.suggestionsService.createAppFeedback(
      userId,
      { ...createDto, photos: photoUrls },
    );
  }

  @Get()
  async getUserSuggestions(@Request() req) {
    const userId = req.user._id.toString();
    return await this.suggestionsService.findByUserId(userId);

  }

  @Get(':id')
  async getSuggestionById(@Param('id') id: string) {
    return await this.suggestionsService.findById(id);

  }
}
