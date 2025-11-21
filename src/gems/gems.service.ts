import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gem, GemDocument } from './entities/gem.entity';
import { GemstoneIdentificationResponseDto } from './dto/gemstone-identification-response.dto';
@Injectable()
export class GemsService {
  constructor(
    @InjectModel(Gem.name)
    private gemModel: Model<GemDocument>,
  ) {}

  async findByName(stoneName: string): Promise<Gem | null> {
    // Search by exact stone_name or in known_as array (case-insensitive)
    const gem = await this.gemModel.findOne({
      $or: [
        { stone_name: { $regex: new RegExp(`^${stoneName}$`, 'i') } },
        { known_as: { $elemMatch: { $regex: new RegExp(`^${stoneName}$`, 'i') } } }
      ]
    }).exec();

    return gem;
  }

  async findMultipleByNames(stoneNames: string[]): Promise<Gem[]> {
    // Search for multiple stones at once
    const gems = await this.gemModel.find({
      $or: [
        { stone_name: { $in: stoneNames.map(name => new RegExp(`^${name}$`, 'i')) } },
        { known_as: { $elemMatch: { $in: stoneNames.map(name => new RegExp(`^${name}$`, 'i')) } } }
      ]
    }).exec();

    return gems;
  }

  async findById(id: string): Promise<Gem | null> {
    try {
      const gem = await this.gemModel.findById(id).exec();
      return gem;
    } catch (error) {
      // Invalid ObjectId format
      return null;
    }
  }

  // Common function to structure gemstone response
  private structureGemstoneResponse(
    gem: Gem,
    confidence: number,
    reasoning: string,
    alternativeMatches: any[] = [],
    modelUsed: string = 'database-lookup'
  ): GemstoneIdentificationResponseDto {
    return {
      // Root level data
      name: gem.stone_name,
      confidence: confidence,
      variety_of: gem.variety_of,
      known_as: gem.known_as,
      albums: gem.albums,
      tags: gem.tags,
      rarity: gem.sections.overview.rarity,
      quick_facts: gem.sections.overview.quick_facts,
      
      // Overview object
      overview: {
        current_market_range: gem.sections.overview.current_market_range,
        description: gem.sections.overview.description,
        stone_profile: gem.sections.overview.stone_profile,
        price: gem.sections.overview.price,
        how_to_select: gem.sections.selection_identification.how_to_select,
        how_to_identify: gem.sections.selection_identification.how_to_identify,
        geographical_occurrence: gem.sections.geographical_occurrence,
        people_often_ask: gem.sections.people_often_ask
      },

      // Meanings object
      meanings: gem.sections.meanings,

      // Properties and Lore combined object
      properties_and_lore: {
        ...gem.sections.properties,
        history: gem.sections.history_lore.history,
        mythology: gem.sections.history_lore.mythology,
        lore: gem.sections.history_lore.lore
      },

      // More object
      more: gem.sections.more,
      
      // Alternative matches
      alternative_matches: alternativeMatches,
      
      // Metadata
      reasoning: reasoning,
      metadata: {
        model_used: modelUsed,
        analysis_timestamp: new Date().toISOString(),
        image_quality_score: modelUsed === 'database-lookup' ? 10 : 5
      },
      
      status: 'found'
    };
  }

  // Service method for gemstone identification with AI + DB
  async identifyGemstoneWithAI(aiResult: any): Promise<GemstoneIdentificationResponseDto> {
    // Search for primary match in database
    const primaryStoneName = aiResult.primary_match.name;
    const primaryGem = await this.findByName(primaryStoneName);

    // Search for alternative matches in database
    const alternativeStoneNames = aiResult.alternative_matches?.map(match => 
      match.name
    ) || [];
    const alternativeGems = await this.findMultipleByNames(alternativeStoneNames);

    // If primary gem not found, return AI-only response
    if (!primaryGem) {
      return {
        name: primaryStoneName,
        confidence: aiResult.primary_match.confidence,
        reasoning: aiResult.reasoning,
        metadata: aiResult.metadata,
        alternative_matches: aiResult.alternative_matches?.map(altMatch => {
          const altGem = alternativeGems.find(gem => 
            gem.stone_name.toLowerCase() === altMatch.name?.toLowerCase() ||
            gem.known_as?.some(known => known.toLowerCase() === altMatch.name?.toLowerCase())
          );

          return {
            name: altMatch.name,
            confidence: altMatch.confidence,
            id: altGem?._id?.toString(),
            albums: altGem?.albums
          };
        }) || [],
        status: 'not_found'
      };
    }

    // Structure alternative matches
    const structuredAlternatives = aiResult.alternative_matches?.map(altMatch => {
      const altGem = alternativeGems.find(gem => 
        gem.stone_name.toLowerCase() === altMatch.name?.toLowerCase() ||
        gem.known_as?.some(known => known.toLowerCase() === altMatch.name?.toLowerCase())
      );

      return {
        name: altMatch.name,
        confidence: altMatch.confidence,
        id: altGem?._id?.toString(),
        albums: altGem?.albums
      };
    }) || [];

    // Use common function to structure response
    return this.structureGemstoneResponse(
      primaryGem,
      aiResult.primary_match.confidence,
      aiResult.reasoning,
      structuredAlternatives,
      aiResult.metadata.model_used
    );
  }

  // Service method for getting gemstone details by ID
  async getGemstoneDetailsById(id: string): Promise<any | null> {
    const gem = await this.findById(id);
    
    if (!gem) {
      return null;
    }

    // Return simplified response without metadata, reasoning, alternative_matches, and status
    return {
      id: gem._id?.toString(),
      name: gem.stone_name,
      confidence: 1.0,
      variety_of: gem.variety_of,
      known_as: gem.known_as,
      albums: gem.albums,
      tags: gem.tags,
      rarity: gem.sections.overview.rarity,
      quick_facts: gem.sections.overview.quick_facts,
      
      overview: {
        current_market_range: gem.sections.overview.current_market_range,
        description: gem.sections.overview.description,
        stone_profile: gem.sections.overview.stone_profile,
        price: gem.sections.overview.price,
        how_to_select: gem.sections.selection_identification.how_to_select,
        how_to_identify: gem.sections.selection_identification.how_to_identify,
        geographical_occurrence: gem.sections.geographical_occurrence,
        people_often_ask: gem.sections.people_often_ask
      },

      meanings: gem.sections.meanings,

      properties_and_lore: {
        ...gem.sections.properties,
        history: gem.sections.history_lore.history,
        mythology: gem.sections.history_lore.mythology,
        lore: gem.sections.history_lore.lore
      },

      more: gem.sections.more
    };
  }
}