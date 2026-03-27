export declare class CreateEmployeeDto {
    employeeNumber: string;
    employeeName: string;
    designation?: string;
    email?: string;
    managerEmpNo?: string;
}
export declare class UpdateEmployeeDto extends CreateEmployeeDto {
    active?: boolean;
}
export declare class EmployeeQueryDto {
    page?: number;
    limit?: number;
    search?: string;
    active?: string;
}
