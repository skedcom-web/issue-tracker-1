import { Module } from '@nestjs/common';
import { IssuesController } from './controllers/issues.controller';
import { IssuesService } from './services/issues.service';
import { ProjectsModule } from '@modules/projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [IssuesController],
  providers: [IssuesService],
  exports: [IssuesService],
})
export class IssuesModule {}
