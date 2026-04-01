import { Module } from '@nestjs/common';
import { ReportsController } from './controllers/reports.controller';
import { ReportsService } from './services/reports.service';
import { RbacGuard } from '@common/guards/rbac.guard';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService, RbacGuard],
})
export class ReportsModule {}
