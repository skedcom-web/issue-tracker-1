import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@common/constants/enums';
export declare const ROLES_KEY = "roles";
export declare function Roles(...roles: Role[]): (target: object, key?: string | symbol, descriptor?: PropertyDescriptor) => object;
export declare class RbacGuard implements CanActivate {
    private reflector;
    constructor(reflector: Reflector);
    canActivate(context: ExecutionContext): boolean;
}
