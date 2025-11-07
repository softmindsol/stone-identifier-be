import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards, 
  Req, 
  Query,
  BadRequestException
} from '@nestjs/common';
import { CollectionsService } from './collections.service';
import { 
  CreateCollectionDto, 
  UpdateCollectionDto, 
  CollectionResponseDto,
  SaveGemstoneToCollectionDto 
} from './dto/collection.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('collections')
@UseGuards(JwtAuthGuard)
export class CollectionsController {
  constructor(private readonly collectionsService: CollectionsService) {}


  @Get('stats')
  async getCollectionStats(
    @Req() req: any,
  ): Promise<{
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
    return this.collectionsService.getUserCollectionStats(req.user.id);
  }

  @Get()
  async findAll(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ): Promise<{
    collections: CollectionResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    
    if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    const validSortFields = ['recently-added', 'date-time', 'name', 'localities', 'stone-type'];
    const validSortOrders = ['asc', 'desc'];
    
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy. Allowed values: ${validSortFields.join(', ')}`);
    }
    
    if (sortOrder && !validSortOrders.includes(sortOrder)) {
      throw new BadRequestException(`Invalid sortOrder. Allowed values: ${validSortOrders.join(', ')}`);
    }
    
    return this.collectionsService.findAllByUser(
      req.user.id, 
      pageNumber, 
      limitNumber, 
      sortBy || 'recently-added',
      sortOrder || 'desc'
    );
  }

  @Get('wishlist')
  async getWishlist(
    @Req() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: string,
  ): Promise<{
    collections: CollectionResponseDto[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const pageNumber = page ? parseInt(page, 10) : 1;
    const limitNumber = limit ? parseInt(limit, 10) : 20;
    
    if (pageNumber < 1 || limitNumber < 1 || limitNumber > 100) {
      throw new BadRequestException('Invalid pagination parameters');
    }

    const validSortFields = ['recently-added', 'date-time', 'name', 'localities', 'stone-type'];
    const validSortOrders = ['asc', 'desc'];
    
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new BadRequestException(`Invalid sortBy. Allowed values: ${validSortFields.join(', ')}`);
    }
    
    if (sortOrder && !validSortOrders.includes(sortOrder)) {
      throw new BadRequestException(`Invalid sortOrder. Allowed values: ${validSortOrders.join(', ')}`);
    }
    
    return this.collectionsService.getWishlistByUser(
      req.user.id, 
      pageNumber, 
      limitNumber,
      sortBy || 'recently-added',
      sortOrder || 'desc'
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<CollectionResponseDto> {
    return this.collectionsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCollectionDto: UpdateCollectionDto,
    @Req() req: any,
  ): Promise<CollectionResponseDto> {
    return this.collectionsService.update(id, req.user.id, updateCollectionDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ message: string }> {
    return this.collectionsService.remove(id, req.user.id);
  }

  @Post('save-gemstone/:gemstoneId')
  async saveGemstoneToCollection(
    @Param('gemstoneId') gemstoneId: string,
    @Body() saveData: SaveGemstoneToCollectionDto,
    @Req() req: any,
  ): Promise<CollectionResponseDto> {
    if (!saveData.name?.trim()) {
      throw new BadRequestException('Collection name is required');
    }
    
    return this.collectionsService.saveGemstoneToCollection(
      req.user.id,
      gemstoneId,
      saveData
    );
  }

  @Post(':id/wishlist')
  async addToWishlist(
    @Param('id') collectionId: string,
    @Req() req: any,
  ): Promise<{ message: string; isWishlisted: boolean }> {
    return this.collectionsService.toggleWishlist(req.user.id, collectionId);
  }
}