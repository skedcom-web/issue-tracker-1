import { AuthService } from '../services/auth.service';
import { LoginDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(dto: LoginDto): Promise<{
        accessToken: string;
        mustChangePassword: boolean;
        user: {
            id: string;
            name: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
            employeeId: string | null;
            employeeNumber: string | null;
            mustChangePassword: boolean;
        };
    }>;
    me(req: {
        user: {
            id: string;
        };
    }): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        employeeId: string | null;
        employeeNumber: string | null;
        mustChangePassword: boolean;
    }>;
    changePassword(req: {
        user: {
            id: string;
        };
    }, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
