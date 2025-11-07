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
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from './entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<User> {
    // Validate that user can only view their own detailed profile
    if (req.user.id !== id) {
      throw new ForbiddenException('You can only view your own detailed profile');
    }
    return this.usersService.findById(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: any,
    @Req() req: any,
  ): Promise<User> {
    if (req.user.id !== id) {
      throw new ForbiddenException('You can only update your own account');
    }
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: any,
  ): Promise<{ message: string }> {
    if (req.user.id !== id) {
      throw new ForbiddenException('You can only delete your own account');
    }
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
