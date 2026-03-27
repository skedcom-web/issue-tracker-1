import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { EmployeesService } from '../services/employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from '../dto/employee.dto';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { RbacGuard, Roles } from '@common/guards/rbac.guard';
import { Role } from '@common/constants/enums';
import { ok, paginated } from '@common/types/global/api-response.interface';

@UseGuards(JwtAuthGuard)
@Controller('api/v1/employees')
export class EmployeesController {
  constructor(private employeesService: EmployeesService) {}

  @Get()
  async findAll(@Query() query: EmployeeQueryDto) {
    const result = await this.employeesService.findAll(query);
    return paginated(result.items, result.total, result.page, result.limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.employeesService.findOne(id);
    return ok(data);
  }

  @UseGuards(RbacGuard)
  @Roles(Role.Admin, Role.Manager)
  @Post()
  async create(@Body() dto: CreateEmployeeDto) {
    const data = await this.employeesService.create(dto);
    return ok(data, 'Employee created');
  }

  @UseGuards(RbacGuard)
  @Roles(Role.Admin, Role.Manager)
  @Post('bulk')
  async bulkUpsert(@Body() body: { rows: CreateEmployeeDto[] }) {
    const data = await this.employeesService.bulkUpsert(body.rows);
    return ok(data, `Imported: ${data.inserted} new, ${data.updated} updated`);
  }

  @UseGuards(RbacGuard)
  @Roles(Role.Admin, Role.Manager)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    const data = await this.employeesService.update(id, dto);
    return ok(data, 'Employee updated');
  }

  @UseGuards(RbacGuard)
  @Roles(Role.Admin, Role.Manager)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.employeesService.remove(id);
    return ok(null, 'Employee deleted');
  }
}
