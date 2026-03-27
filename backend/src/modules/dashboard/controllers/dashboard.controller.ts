import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { IssuesService } from '@modules/issues/services/issues.service';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { ok } from '@common/types/global/api-response.interface';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/dashboard')
export class DashboardController {
  constructor(private issuesService: IssuesService) {}

  @Get('stats')
  async stats(@Query('projectId') projectId?: string) {
    const pid = projectId ? Number(projectId) : undefined;
    const data = await this.issuesService.getStats(pid);
    return ok(data, 'Dashboard stats retrieved');
  }
}
