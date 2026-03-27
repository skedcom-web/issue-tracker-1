import { Module } from '@nestjs/common';
import { DashboardController } from './controllers/dashboard.controller';
import { IssuesModule } from '@modules/issues/issues.module';

@Module({
  imports: [IssuesModule],
  controllers: [DashboardController],
})
export class DashboardModule {}
