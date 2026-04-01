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
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            department: string | null;
            employeeNumber: string | null;
            active: boolean;
            mustChangePassword: boolean;
            createdAt: Date;
            updatedAt: Date;
            employeeId: string | null;
        };
        tempPassword: string;
    }>>;
    update(id: string, dto: UpdateUserDto): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        employeeNumber: string | null;
        active: boolean;
        mustChangePassword: boolean;
        createdAt: Date;
        updatedAt: Date;
        employeeId: string | null;
    }>>;
    resetPassword(id: string): Promise<import("@common/types/global/api-response.interface").ApiResponse<{
        tempPassword: string;
    }>>;
    remove(id: string): Promise<import("@common/types/global/api-response.interface").ApiResponse<null>>;
}
