import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GemstoneIdentificationResult {
  primary_match: {
    name: string;
    confidence: number;
    reasoning: string;
  };
  alternative_matches: Array<{
    name: string;
    confidence: number;
    reasoning: string;
  }>;
  reasoning: string;
  metadata: {
    model_used: string;
    analysis_timestamp: string;
    image_quality_score: number;
  };
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is required but not found in environment variables');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    this.logger.log('GeminiService initialized with Gemini 2.5 Flash model');
  }

  async identifyGemstone(
    imageBuffer: Buffer,
    mimeType: string,
    prompt: string,
  ): Promise<GemstoneIdentificationResult> {
    try {
      this.logger.log('Starting gemstone identification with Gemini 2.5 Flash');

      // Validate image buffer
      if (!imageBuffer || imageBuffer.length === 0) {
        throw new BadRequestException('Invalid image buffer provided');
      }

      // Validate MIME type
      const supportedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
      if (!supportedMimeTypes.includes(mimeType)) {
        throw new BadRequestException(
          `Unsupported image format: ${mimeType}. Supported formats: ${supportedMimeTypes.join(', ')}`
        );
      }

      // Convert buffer to base64
      const base64Image = imageBuffer.toString('base64');

      // Prepare the image part for Gemini
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      };

      this.logger.log(`Processing image of size: ${imageBuffer.length} bytes, type: ${mimeType}`);

      // Generate content with image and prompt
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      this.logger.log('Received response from Gemini, parsing JSON...');
      this.logger.debug('Raw Gemini response:', text);

      // Parse the JSON response
      let parsedResult: GemstoneIdentificationResult;
      try {
        // Remove any markdown code blocks if present
        const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
        this.logger.debug('Cleaned text for parsing:', cleanedText);
        parsedResult = JSON.parse(cleanedText);
      } catch (parseError) {
        this.logger.error('Failed to parse Gemini response as JSON', parseError);
        this.logger.debug('Raw response:', text);
        
        // Fallback: try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedResult = JSON.parse(jsonMatch[0]);
          } catch {
            throw new BadRequestException('Failed to parse Gemini response. The model may have returned invalid JSON.');
          }
        } else {
          throw new BadRequestException('No valid JSON found in Gemini response.');
        }
      }

      // Log the parsed result for debugging
      this.logger.debug('Parsed result from Gemini:', JSON.stringify(parsedResult, null, 2));
      
      // Normalize the response structure if needed
      parsedResult = this.normalizeGemstoneResult(parsedResult);
      
      // Validate the response structure
      if (!this.isValidGemstoneResult(parsedResult)) {
        this.logger.error('Invalid response structure from Gemini');
        this.logger.error('Expected structure not found in:', JSON.stringify(parsedResult, null, 2));
        throw new BadRequestException('Invalid response structure from Gemini API');
      }

      // Add metadata
      parsedResult.metadata = {
        model_used: 'gemini-2.5-flash',
        analysis_timestamp: new Date().toISOString(),
        image_quality_score: this.estimateImageQuality(imageBuffer),
      };

      this.logger.log(`Successfully identified gemstone: ${parsedResult.primary_match.name}`);
      return parsedResult;

    } catch (error) {
      this.logger.error('Error during gemstone identification:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Handle Gemini API specific errors
      if (error.message?.includes('API_KEY')) {
        throw new BadRequestException('Invalid Gemini API key configuration');
      }
      
      if (error.message?.includes('quota')) {
        throw new BadRequestException('Gemini API quota exceeded. Please try again later.');
      }
      
      if (error.message?.includes('safety')) {
        throw new BadRequestException('Image content blocked by safety filters');
      }

      throw new BadRequestException('Failed to analyze image with Gemini API');
    }
  }

  private normalizeGemstoneResult(result: any): any {
    // Handle different response formats that Gemini might return
    if (result && typeof result === 'object') {
      // Ensure primary_match has the correct property name
      if (result.primary_match && result.primary_match.stone_name && !result.primary_match.name) {
        result.primary_match.name = result.primary_match.stone_name;
      }
      
      // Ensure alternative_matches have the correct property names
      if (Array.isArray(result.alternative_matches)) {
        result.alternative_matches = result.alternative_matches.map((match: any) => {
          if (match.stone_name && !match.name) {
            match.name = match.stone_name;
          }
          return match;
        });
      }
      
      // Ensure alternative_matches exists as array
      if (!result.alternative_matches) {
        result.alternative_matches = [];
      }
      
      // Provide default reasoning if missing
      if (!result.reasoning && result.primary_match && result.primary_match.reasoning) {
        result.reasoning = result.primary_match.reasoning;
      }
    }
    
    return result;
  }

  private isValidGemstoneResult(result: any): result is GemstoneIdentificationResult {
    this.logger.debug('Validating result structure...');
    
    if (!result || typeof result !== 'object') {
      this.logger.error('Result is not an object');
      return false;
    }
    
    if (!result.primary_match) {
      this.logger.error('Missing primary_match');
      return false;
    }
    
    if (!result.primary_match.stone_name && !result.primary_match.name) {
      this.logger.error('Missing stone_name/name in primary_match');
      return false;
    }
    
    if (typeof result.primary_match.confidence !== 'number') {
      this.logger.error('Missing or invalid confidence in primary_match');
      return false;
    }
    
    if (!Array.isArray(result.alternative_matches)) {
      this.logger.error('Missing or invalid alternative_matches array');
      return false;
    }
    
    if (!result.reasoning || typeof result.reasoning !== 'string') {
      this.logger.error('Missing or invalid reasoning');
      return false;
    }
    
    this.logger.debug('Result structure validation passed');
    return true;
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      this.logger.log('Generating embedding with Gemini');

      // Get the embedding model
      const embeddingModel = this.genAI.getGenerativeModel({ model: 'text-embedding-004' });
      
      // Generate embedding
      const result = await embeddingModel.embedContent(text);
      
      if (!result || !result.embedding || !result.embedding.values || !Array.isArray(result.embedding.values)) {
        throw new BadRequestException('Invalid embedding response from Gemini');
      }

      this.logger.log(`Generated embedding with ${result.embedding.values.length} dimensions`);
      return result.embedding.values;

    } catch (error) {
      this.logger.error('Error generating embedding:', error);
      
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      if (error.message?.includes('API_KEY')) {
        throw new BadRequestException('Invalid Gemini API key configuration');
      }
      
      if (error.message?.includes('quota')) {
        throw new BadRequestException('Gemini API quota exceeded. Please try again later.');
      }

      throw new BadRequestException('Failed to generate embedding with Gemini API');
    }
  }

  private estimateImageQuality(imageBuffer: Buffer): number {
    // Simple image quality estimation based on file size
    // This is a basic heuristic - could be improved with actual image analysis
    const sizeInKB = imageBuffer.length / 1024;
    
    if (sizeInKB < 50) return 3; // Very low quality
    if (sizeInKB < 200) return 5; // Low quality
    if (sizeInKB < 500) return 7; // Medium quality
    if (sizeInKB < 1000) return 8; // High quality
    return 9; // Very high quality
  }
}