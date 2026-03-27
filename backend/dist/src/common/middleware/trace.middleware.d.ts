import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
export interface RequestWithTrace extends Request {
    traceId: string;
    spanId: string;
}
export declare class TraceMiddleware implements NestMiddleware {
    use(req: RequestWithTrace, res: Response, next: NextFunction): void;
    private isValidTraceparent;
    private generateSpanId;
}
