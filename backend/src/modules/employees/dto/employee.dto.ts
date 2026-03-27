import { IsString, IsOptional, IsEmail, IsBoolean } from 'class-validator';

export class CreateEmployeeDto {
  @IsString()
  employeeNumber: string;

  @IsString()
  employeeName: string;

  @IsOptional()
  @IsString()
  designation?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  managerEmpNo?: string;
}

export class UpdateEmployeeDto extends CreateEmployeeDto {
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class EmployeeQueryDto {
  @IsOptional()
  page?: number = 1;

  @IsOptional()
  limit?: number = 50;

  @IsOptional()
  search?: string;

  @IsOptional()
  active?: string;
}
