import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithTrace extends Request {
  traceId: string;
  spanId: string;
}

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: RequestWithTrace, res: Response, next: NextFunction): void {
    const incoming = req.headers['traceparent'] as string | undefined;
    let traceId: string;
    let spanId: string;

    if (incoming && this.isValidTraceparent(incoming)) {
      // Reuse existing traceId, generate new spanId
      const parts = incoming.split('-');
      traceId = parts[1];
      spanId = this.generateSpanId();
    } else {
      traceId = uuidv4().replace(/-/g, '');
      spanId = this.generateSpanId();
    }

    req.traceId = traceId;
    req.spanId = spanId;

    // Return traceparent in response (without exposing spanId details)
    const outgoing = `00-${traceId}-${spanId}-01`;
    res.setHeader('traceparent', outgoing);

    next();
  }

  private isValidTraceparent(value: string): boolean {
    return /^00-[0-9a-f]{32}-[0-9a-f]{16}-[0-9a-f]{2}$/.test(value);
  }

  private generateSpanId(): string {
    return [...Array(16)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
  }
}
