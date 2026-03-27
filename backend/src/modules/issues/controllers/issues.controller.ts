import {
  Controller, Get, Post, Patch, Body,
  Param, Query, ParseIntPipe, UseGuards, Request,
} from '@nestjs/common';
import { IssuesService } from '../services/issues.service';
import { CreateIssueDto, UpdateIssueDto, CreateCommentDto, IssueQueryDto } from '../dto/issue.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ok } from '@common/types/global/api-response.interface';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/issues')
export class IssuesController {
  constructor(private issuesService: IssuesService) {}

  @Get()
  async findAll(@Query() query: IssueQueryDto) {
    const data = await this.issuesService.findAll(query);
    return ok(data, 'Issues retrieved');
  }

  @Get('stats')
  async stats(@Query('projectId') projectId?: string) {
    const pid = projectId ? Number(projectId) : undefined;
    const data = await this.issuesService.getStats(pid);
    return ok(data, 'Stats retrieved');
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const data = await this.issuesService.findOne(id);
    return ok(data, 'Issue retrieved');
  }

  @Post()
  async create(
    @Body() dto: CreateIssueDto,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.issuesService.create(dto, req.user.id);
    return ok(data, 'Issue created');
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateIssueDto,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.issuesService.update(id, dto, req.user.id);
    return ok(data, 'Issue updated');
  }

  @Post(':id/comments')
  async addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateCommentDto,
    @Request() req: { user: { id: string } },
  ) {
    const data = await this.issuesService.addComment(id, dto, req.user.id);
    return ok(data, 'Comment added');
  }
}
