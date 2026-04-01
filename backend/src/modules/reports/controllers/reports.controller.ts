import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from '../services/reports.service';
import { ReportQueryDto } from '../dto/report-query.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RbacGuard, Roles } from '@common/guards/rbac.guard';
import { Role } from '@common/constants/enums';
import { ok } from '@common/types/global/api-response.interface';

@UseGuards(JwtAuthGuard, RbacGuard)
@Controller('api/v1/reports')
export class ReportsController {
  constructor(private reportsService: ReportsService) {}

  @Roles(Role.Admin, Role.Manager)
  @Get('executive-summary')
  async executiveSummary(@Query() query: ReportQueryDto) {
    const data = await this.reportsService.executiveSummary(query);
    return ok(data, 'Executive summary');
  }

  @Roles(Role.Admin, Role.Manager)
  @Get('by-project')
  async byProject(@Query() query: ReportQueryDto) {
    const data = await this.reportsService.byProject(query);
    return ok(data, 'Project-wise report');
  }

  @Roles(Role.Admin, Role.Manager)
  @Get('by-reporter')
  async byReporter(@Query() query: ReportQueryDto) {
    const data = await this.reportsService.byReporter(query);
    return ok(data, 'Reporter workload');
  }

  @Roles(Role.Admin, Role.Manager)
  @Get('by-assignee')
  async byAssignee(@Query() query: ReportQueryDto) {
    const data = await this.reportsService.byAssignee(query);
    return ok(data, 'Assignee workload');
  }

  @Roles(Role.Admin, Role.Manager)
  @Get('overdue-aging')
  async overdueAging(@Query() query: ReportQueryDto) {
    const data = await this.reportsService.overdueAging(query);
    return ok(data, 'Overdue aging');
  }

  @Roles(Role.Admin, Role.Manager)
  @Get('issue-register')
  async issueRegister(@Query() query: ReportQueryDto) {
    const data = await this.reportsService.issueRegister(query);
    return ok(data, 'Issue register');
  }

  @Roles(Role.Admin, Role.Manager)
  @Get('weekly-trend')
  async weeklyTrend(@Query() query: ReportQueryDto) {
    const data = await this.reportsService.weeklyTrend(query);
    return ok(data, 'Weekly trend');
  }

  @Roles(Role.Admin, Role.Manager)
  @Get('priority-matrix')
  async priorityMatrix(@Query() query: ReportQueryDto) {
    const data = await this.reportsService.priorityMatrix(query);
    return ok(data, 'Priority vs status matrix');
  }
}
