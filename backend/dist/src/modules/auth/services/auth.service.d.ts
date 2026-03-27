import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@infrastructure/database/prisma/prisma.service';
import { EmailService } from '@infrastructure/email/email.service';
import { LoginDto, ChangePasswordDto, ForgotPasswordDto, ResetPasswordDto } from '../dto/auth.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    private email;
    constructor(prisma: PrismaService, jwt: JwtService, email: EmailService);
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
    me(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        role: import(".prisma/client").$Enums.Role;
        department: string | null;
        employeeId: string | null;
        employeeNumber: string | null;
        mustChangePassword: boolean;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
}
