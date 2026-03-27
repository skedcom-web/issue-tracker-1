import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeQueryDto } from '../dto/employee.dto';
export declare class EmployeesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: EmployeeQueryDto): Promise<{
        items: {
            id: string;
            email: string | null;
            employeeNumber: string;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
            employeeName: string;
            designation: string | null;
            managerEmpNo: string | null;
        }[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        email: string | null;
        employeeNumber: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        employeeName: string;
        designation: string | null;
        managerEmpNo: string | null;
    }>;
    create(dto: CreateEmployeeDto): Promise<{
        id: string;
        email: string | null;
        employeeNumber: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        employeeName: string;
        designation: string | null;
        managerEmpNo: string | null;
    }>;
    update(id: string, dto: UpdateEmployeeDto): Promise<{
        id: string;
        email: string | null;
        employeeNumber: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        employeeName: string;
        designation: string | null;
        managerEmpNo: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string | null;
        employeeNumber: string;
        active: boolean;
        createdAt: Date;
        updatedAt: Date;
        employeeName: string;
        designation: string | null;
        managerEmpNo: string | null;
    }>;
    bulkUpsert(rows: CreateEmployeeDto[]): Promise<{
        inserted: number;
        updated: number;
    }>;
}
