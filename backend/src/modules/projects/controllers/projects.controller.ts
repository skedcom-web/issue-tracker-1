import {
  Controller, Get, Post, Put, Delete,
  Body, Param, ParseIntPipe, UseGuards, Request,
} from '@nestjs/common';
import { ProjectsService } from '../services/projects.service';
import { CreateProjectDto, UpdateProjectDto } from '../dto/project.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RbacGuard, Roles } from '@common/guards/rbac.guard';
import { Role } from '@common/constants/enums';
import { ok } from '@common/types/global/api-response.interface';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  async findAll() {
    const data = await this.projectsService.findAll();
    return ok(data, 'Projects retrieved');
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.projectsService.findOne(id);
    return ok(data, 'Project retrieved');
  }

  @UseGuards(RbacGuard)
  @Roles(Role.Admin, Role.Manager)
  @Post()
  async create(
    @Body() dto: CreateProjectDto,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.projectsService.create(dto, req.user.id);
    return ok(data, 'Project created');
  }

  @UseGuards(RbacGuard)
  @Roles(Role.Admin, Role.Manager)
  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProjectDto,
  ) {
    const data = await this.projectsService.update(id, dto);
    return ok(data, 'Project updated');
  }

  @UseGuards(RbacGuard)
  @Roles(Role.Admin)
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.projectsService.remove(id);
    return ok(null, 'Project deleted');
  }
}
