import { Role } from '@common/constants/enums';
export declare class CreateUserDto {
    name: string;
    email: string;
    role: Role;
    department?: string;
    employeeId?: string;
}
export declare class UpdateUserDto {
    role?: Role;
    department?: string;
    active?: boolean;
}
