import { Controller, Post, Get, Param, UseInterceptors, UploadedFile, BadRequestException, UseGuards, NotFoundException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GeminiService } from '../common/services/gemini.service';
import { GemsService } from './gems.service';
import { createGemstoneIdentificationPrompt } from './prompts/gemstone-identification.prompt';
import { GemstoneIdentificationResponseDto } from './dto/gemstone-identification-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@Controller('gems')
@UseGuards(JwtAuthGuard)
export class GemsController {
  constructor(
    private readonly geminiService: GeminiService,
    private readonly gemsService: GemsService,
  ) {}

  @Post('identify')
  @UseInterceptors(FileInterceptor('image', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, callback) => {
      // Check file type
      const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
      if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new BadRequestException(
          `Unsupported file type: ${file.mimetype}. Supported types: ${allowedMimeTypes.join(', ')}`
        ), false);
      }
    },
  }))
  async identifyGemstone(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<GemstoneIdentificationResponseDto> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    try {
      // Step 1: Get AI identification from Gemini
      const prompt = createGemstoneIdentificationPrompt();
      const aiResult = await this.geminiService.identifyGemstone(
        file.buffer,
        file.mimetype,
        prompt,
      );

      // Step 2: Use service to process AI result and structure response
      const response = await this.gemsService.identifyGemstoneWithAI(aiResult);
      
      return response;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to process gemstone identification: ' + error.message);
    }
  }

  @Get(':id')
  async getGemstoneDetails(
    @Param('id') id: string,
  ): Promise<GemstoneIdentificationResponseDto> {
    try {
      // Use service to get gemstone details
      const response = await this.gemsService.getGemstoneDetailsById(id);
      
      if (!response) {
        throw new NotFoundException(`Gemstone with ID ${id} not found`);
      }

      return response;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException('Failed to retrieve gemstone details: ' + error.message);
    }
  }

}