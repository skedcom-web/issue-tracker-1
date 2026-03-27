import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RbacGuard, Roles } from '@common/guards/rbac.guard';
import { Role } from '@common/constants/enums';
import { ok } from '@common/types/global/api-response.interface';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('api/v1/users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Roles(Role.Admin, Role.Manager)
  @Get()
  async findAll() {
    const data = await this.usersService.findAll();
    return ok(data, 'Users retrieved');
  }

  @Roles(Role.Admin, Role.Manager)
  @Post()
  async create(@Body() dto: CreateUserDto) {
    const data = await this.usersService.create(dto);
    return ok(data, 'User created');
  }

  @Roles(Role.Admin, Role.Manager)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const data = await this.usersService.update(id, dto);
    return ok(data, 'User updated');
  }

  @Roles(Role.Admin, Role.Manager)
  @Post(':id/reset-password')
  async resetPassword(@Param('id') id: string) {
    const data = await this.usersService.resetPassword(id);
    return ok(data, 'Password reset');
  }

  @Roles(Role.Admin)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.usersService.remove(id);
    return ok(null, 'User deleted');
  }
}
