import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GemsModule } from './gems/gems.module';
import { CollectionsModule } from './collections/collections.module';
import { SuggestionsModule } from './suggestions/suggestions.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    GemsModule,
    CollectionsModule,
    SuggestionsModule,
  ],
})
export class AppModule {}
