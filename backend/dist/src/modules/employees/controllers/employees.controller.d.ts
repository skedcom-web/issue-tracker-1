import { EmployeesService } from '../services/employees.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from '../dto/employee.dto';
export declare class EmployeesController {
    private employeesService;
    constructor(employeesService: EmployeesService);
    findAll(query: EmployeeQueryDto): Promise<import("@common/types/global/api-response.interface").ApiResponse<import("@common/types/global/api-response.interface").PaginatedResult<{
        id: string;
        email: string | null;
        employeeNumber: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        employeeName: string;
        designation: string | null;
        managerEmpNo: string | null;
    }>>>;
    findOne(id: string): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
        id: string;
        email: string | null;
        employeeNumber: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        employeeName: string;
        designation: string | null;
        managerEmpNo: string | null;
    }>>;
    create(dto: CreateEmployeeDto): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
        id: string;
        email: string | null;
        employeeNumber: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        employeeName: string;
        designation: string | null;
        managerEmpNo: string | null;
    }>>;
    bulkUpsert(body: {
        rows: CreateEmployeeDto[];
    }): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
        inserted: number;
        updated: number;
    }>>;
    update(id: string, dto: UpdateEmployeeDto): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
        id: string;
        email: string | null;
        employeeNumber: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        employeeName: string;
        designation: string | null;
        managerEmpNo: string | null;
    }>>;
    remove(id: string): Promise<import("@common/types/global/api-response.interface").ApiResponse<null>>;
}
