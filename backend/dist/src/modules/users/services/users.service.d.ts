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
                email: string | null;
                employeeNumber: string;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
                employeeName: string;
                designation: string | null;
                managerEmpNo: string | null;
            } | null;
            id: string;
            email: string;
            employeeId: string | null;
            name: string;
            role: import(".prisma/client").$Enums.Role;
            department: string | null;
            employeeNumber: string | null;
            active: boolean;
            mustChangePassword: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        tempPassword: string;
    }>;
    update(id: string, dto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        employeeId: string | null;
        name: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        employeeNumber: string | null;
        active: boolean;
        mustChangePassword: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    resetPassword(id: string): Promise<{
        tempPassword: string;
    }>;
    remove(id: string): Promise<void>;
}
