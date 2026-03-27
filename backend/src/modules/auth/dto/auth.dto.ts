import { IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsString()
  credential: string;

  @IsString()
  @MinLength(6)
  password: string;
}

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class ForgotPasswordDto {
  @IsString()
  credential: string; // email OR employee number
}

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  userId: string;

  @IsString()
  @MinLength(6)
  newPassword: string;
}
