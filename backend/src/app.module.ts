import { Module } from '@nestjs/common';
import { PrismaModule } from '@infrastructure/database/prisma/prisma.module';
import { EmailModule } from '@infrastructure/email/email.module';
import { AuthModule } from '@modules/auth/auth.module';
import { UsersModule } from '@modules/users/users.module';
import { EmployeesModule } from '@modules/employees/employees.module';
import { ProjectsModule } from '@modules/projects/projects.module';
import { IssuesModule } from '@modules/issues/issues.module';
import { DashboardModule } from '@modules/dashboard/dashboard.module';

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    AuthModule,
    UsersModule,
    EmployeesModule,
    ProjectsModule,
    IssuesModule,
    DashboardModule,
  ],
})
export class AppModule {}
