import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollectionsService } from './collections.service';
import { CollectionsController } from './collections.controller';
import { Collection, CollectionSchema } from './entities/collection.entity';
import { GemsModule } from '../gems/gems.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Collection.name, schema: CollectionSchema }]),
    GemsModule,
  ],
  controllers: [CollectionsController],
  providers: [CollectionsService],
  exports: [CollectionsService],
})
export class CollectionsModule {}