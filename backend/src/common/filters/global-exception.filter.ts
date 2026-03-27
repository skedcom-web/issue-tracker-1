import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { RequestWithTrace } from '@common/middleware/trace.middleware';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithTrace>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? this.extractMessage(exception)
        : 'Internal server error';

    const code =
      exception instanceof HttpException
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

  private extractMessage(exception: HttpException): string {
    const response = exception.getResponse();
    if (typeof response === 'string') return response;
    if (typeof response === 'object' && response !== null) {
      const r = response as Record<string, unknown>;
      if (Array.isArray(r['message'])) return (r['message'] as string[]).join(', ');
      if (typeof r['message'] === 'string') return r['message'];
    }
    return exception.message;
  }
}
