"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
let GlobalExceptionFilter = class GlobalExceptionFilter {
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        const status = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof common_1.HttpException
            ? this.extractMessage(exception)
            : 'Internal server error';
        const code = exception instanceof common_1.HttpException
            ? `HTTP_${status}`
            : 'INTERNAL_SERVER_ERROR';
        response.status(status).json({
            success: false,
            error: {
                code,
                message,
            },
            meta: {
                traceId: request.traceId ?? 'unknown',
            },
        });
    }
    extractMessage(exception) {
        const response = exception.getResponse();
        if (typeof response === 'string')
            return response;
        if (typeof response === 'object' && response !== null) {
            const r = response;
            if (Array.isArray(r['message']))
                return r['message'].join(', ');
            if (typeof r['message'] === 'string')
                return r['message'];
        }
        return exception.message;
    }
};
exports.GlobalExceptionFilter = GlobalExceptionFilter;
exports.GlobalExceptionFilter = GlobalExceptionFilter = __decorate([
    (0, common_1.Catch)()
], GlobalExceptionFilter);
//# sourceMappingURL=global-exception.filter.js.map