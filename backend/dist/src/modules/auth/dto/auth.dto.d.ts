export declare class LoginDto {
    credential: string;
    password: string;
}
export declare class ChangePasswordDto {
    currentPassword: string;
    newPassword: string;
}
export declare class ForgotPasswordDto {
    credential: string;
}
export declare class ResetPasswordDto {
    token: string;
    userId: string;
    newPassword: string;
}
