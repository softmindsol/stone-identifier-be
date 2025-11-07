import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Collection, CollectionDocument } from './entities/collection.entity';
import { CreateCollectionDto, UpdateCollectionDto, CollectionResponseDto, SaveGemstoneToCollectionDto } from './dto/collection.dto';
import { GemsService } from '../gems/gems.service';

@Injectable()
export class CollectionsService {
  constructor(
    @InjectModel(Collection.name)
    private collectionModel: Model<CollectionDocument>,
    private gemsService: GemsService,
  ) {}

  async findAllByUser(
    userId: string, 
    page: number = 1, 
    limit: number = 20, 
    sortBy: string = 'recently-added',
    sortOrder: string = 'desc'
  ): Promise<{
    collections: CollectionResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    // Map sort fields to database fields
    const sortFieldMap: { [key: string]: any } = {
      'recently-added': { createdAt: sortDirection },
      'date-time': { acquisitionDate: sortDirection, createdAt: sortDirection },
      'name': { name: sortDirection },
      'localities': { locality: sortDirection },
      'stone-type': { identifiedAs: sortDirection, type: sortDirection }
    };
    
    const sortCriteria = sortFieldMap[sortBy] || { createdAt: -1 };
    
    const [collections, total] = await Promise.all([
      this.collectionModel
        .find({ userId: new Types.ObjectId(userId), isActive: true })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.collectionModel.countDocuments({ userId: new Types.ObjectId(userId), isActive: true })
    ]);

    return {
      collections: collections.map(collection => this.transformToResponseDto(collection)),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async findOne(id: string, userId: string): Promise<CollectionResponseDto> {
    const collection = await this.collectionModel.findById(id).exec();
    
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    if (collection.userId.toString() !== userId) {
      throw new ForbiddenException('You can only access your own collections');
    }

    if (!collection.isActive) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    return this.transformToResponseDto(collection);
  }

  async update(id: string, userId: string, updateCollectionDto: UpdateCollectionDto): Promise<CollectionResponseDto> {
    const collection = await this.collectionModel.findById(id).exec();
    
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    if (collection.userId.toString() !== userId) {
      throw new ForbiddenException('You can only update your own collections');
    }

    if (!collection.isActive) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    // Update fields
    Object.assign(collection, {
      ...updateCollectionDto,
      acquisitionDate: updateCollectionDto.acquisitionDate ? new Date(updateCollectionDto.acquisitionDate) : collection.acquisitionDate,
    });

    const updatedCollection = await collection.save();
    return this.transformToResponseDto(updatedCollection);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const collection = await this.collectionModel.findById(id).exec();
    
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    if (collection.userId.toString() !== userId) {
      throw new ForbiddenException('You can only delete your own collections');
    }

    if (!collection.isActive) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    // Soft delete
    collection.isActive = false;
    await collection.save();

    return { message: 'Collection deleted successfully' };
  }

  async saveGemstoneToCollection(
    userId: string, 
    gemstoneId: string, 
    saveData: SaveGemstoneToCollectionDto
  ): Promise<CollectionResponseDto> {
    // Fetch gemstone data from the gems collection
    const gemstone = await this.gemsService.findById(gemstoneId);
    
    if (!gemstone) {
      throw new NotFoundException(`Gemstone with ID ${gemstoneId} not found`);
    }

    const collection = new this.collectionModel({
      ...saveData,
      userId: new Types.ObjectId(userId),
      gemstoneRef: new Types.ObjectId(gemstoneId),
      identifiedAs: gemstone.stone_name,
      confidence: 1.0,
      acquisitionDate: saveData.acquisitionDate ? new Date(saveData.acquisitionDate) : new Date(),
    });

    const savedCollection = await collection.save();
    return this.transformToResponseDto(savedCollection);
  }

  async toggleWishlist(userId: string, collectionId: string): Promise<{ message: string; isWishlisted: boolean }> {
    const collection = await this.collectionModel.findById(collectionId).exec();
    
    if (!collection) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }

    if (collection.userId.toString() !== userId) {
      throw new ForbiddenException('You can only wishlist your own collections');
    }

    if (!collection.isActive) {
      throw new NotFoundException(`Collection with ID ${collectionId} not found`);
    }

    // Toggle wishlist status
    collection.isWishlisted = !collection.isWishlisted;
    await collection.save();

    return {
      message: collection.isWishlisted 
        ? 'Collection added to wishlist successfully' 
        : 'Collection removed from wishlist successfully',
      isWishlisted: collection.isWishlisted
    };
  }

  async getWishlistByUser(
    userId: string, 
    page: number = 1, 
    limit: number = 20,
    sortBy: string = 'recently-added',
    sortOrder: string = 'desc'
  ): Promise<{
    collections: CollectionResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    
    // Map sort fields to database fields
    const sortFieldMap: { [key: string]: any } = {
      'recently-added': { createdAt: sortDirection },
      'date-time': { acquisitionDate: sortDirection, createdAt: sortDirection },
      'name': { name: sortDirection },
      'localities': { locality: sortDirection },
      'stone-type': { identifiedAs: sortDirection, type: sortDirection }
    };
    
    const sortCriteria = sortFieldMap[sortBy] || { createdAt: -1 };
    
    const [collections, total] = await Promise.all([
      this.collectionModel
        .find({ 
          userId: new Types.ObjectId(userId), 
          isActive: true, 
          isWishlisted: true 
        })
        .sort(sortCriteria)
        .skip(skip)
        .limit(limit)
        .exec(),
      this.collectionModel.countDocuments({ 
        userId: new Types.ObjectId(userId), 
        isActive: true, 
        isWishlisted: true 
      })
    ]);

    return {
      collections: collections.map(collection => this.transformToResponseDto(collection)),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getUserCollectionStats(userId: string): Promise<{
    totalCollections: number;
    rarityBreakdown: {
      sRarity: number;
      aRarity: number;
      bRarity: number;
      cRarity: number;
      unknown: number;
    };
    collectionScore: string;
    rarityIndex: string;
    wishlisted: number;
  }> {
    // Get all user collections with gemstone references
    const collections = await this.collectionModel
      .find({ userId: new Types.ObjectId(userId), isActive: true })
      .populate('gemstoneRef')
      .exec();

    const totalCollections = collections.length;
    const wishlisted = collections.filter(c => c.isWishlisted).length;

    // Initialize rarity breakdown
    const rarityBreakdown = {
      sRarity: 0,
      aRarity: 0,
      bRarity: 0,
      cRarity: 0,
      unknown: 0
    };

    // Count rarities based on gemstone data
    for (const collection of collections) {
      if (collection.gemstoneRef && (collection.gemstoneRef as any).sections?.overview?.rarity?.grade) {
        const rarityGrade = (collection.gemstoneRef as any).sections.overview.rarity.grade.toLowerCase();
        switch (rarityGrade) {
          case 's':
          case 's-rank':
          case 's-rarity':
            rarityBreakdown.sRarity++;
            break;
          case 'a':
          case 'a-rank':
          case 'a-rarity':
            rarityBreakdown.aRarity++;
            break;
          case 'b':
          case 'b-rank':
          case 'b-rarity':
            rarityBreakdown.bRarity++;
            break;
          case 'c':
          case 'c-rank':
          case 'c-rarity':
            rarityBreakdown.cRarity++;
            break;
          default:
            rarityBreakdown.unknown++;
            break;
        }
      } else {
        rarityBreakdown.unknown++;
      }
    }

    const collectionScore = 'Impressive!'

    // Determine rarity index based on collection composition
    let rarityIndex = 'Rising';

    return {
      totalCollections,
      rarityBreakdown,
      collectionScore,
      rarityIndex,
      wishlisted
    };
  }

  private transformToResponseDto(collection: CollectionDocument): CollectionResponseDto {
    return {
      id: collection._id.toString(),
      userId: collection.userId.toString(),
      name: collection.name,
      serialNo: collection.serialNo,
      photos: collection.photos,
      acquisitionDate: collection.acquisitionDate,
      acquisitionPrice: collection.acquisitionPrice,
      currency: collection.currency,
      locality: collection.locality,
      type: collection.type,
      stoneSize: collection.stoneSize,
      notes: collection.notes,
      gemstoneRef: collection.gemstoneRef?.toString(),
      identifiedAs: collection.identifiedAs,
      confidence: collection.confidence,
      tags: collection.tags,
      isWishlisted: collection.isWishlisted,
      isActive: collection.isActive,
      createdAt: collection.createdAt!,
      updatedAt: collection.updatedAt!,
    };
  }
}