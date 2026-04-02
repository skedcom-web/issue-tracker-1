import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { EmailService } from '@infrastructure/email/email.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
export declare class UsersService {
    private prisma;
    private email;
    constructor(prisma: PrismaService, email: EmailService);
    findAll(): Promise<{
        [key: string]: unknown;
    }[]>;
    create(dto: CreateUserDto): Promise<{
        user: {
            employee: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                email: string | null;
                employeeNumber: string;
                active: boolean;
                employeeName: string;
                designation: string | null;
                managerEmpNo: string | null;
            } | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            department: string | null;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            employeeNumber: string | null;
            active: boolean;
            mustChangePassword: boolean;
            employeeId: string | null;
        };
        tempPassword: string;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        department: string | null;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        employeeNumber: string | null;
        active: boolean;
        mustChangePassword: boolean;
        employeeId: string | null;
    }>;
    resetPassword(id: string): Promise<{
        tempPassword: string;
    }>;
    remove(id: string): Promise<void>;
}
