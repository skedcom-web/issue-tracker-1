import { UsersService } from '../services/users.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
        [key: string]: unknown;
    }[]>>;
    create(dto: CreateUserDto): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
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
    }>>;
    update(id: string, dto: UpdateUserDto): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
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
    }>>;
    resetPassword(id: string): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
        tempPassword: string;
    }>>;
    remove(id: string): Promise<import("@common/types/global/api-response.interface").ApiResponse<null>>;
}
