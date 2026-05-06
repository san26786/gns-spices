import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ZodError } from 'zod';

/**
 * RFC 7807 application/problem+json error envelope.
 * Keeps the response shape consistent across HTTP, validation, and prisma errors.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('Exception');

  catch(exception: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const res = http.getResponse<Response>();
    const req = http.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'internal_error';
    let title = 'Internal Server Error';
    let detail: string | undefined;
    let errors: unknown = undefined;

    if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'validation_error';
      title = 'Validation failed';
      errors = exception.flatten();
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse();
      if (typeof body === 'string') {
        detail = body;
      } else if (typeof body === 'object' && body !== null) {
        const b = body as Record<string, unknown>;
        detail = (b.message as string) ?? undefined;
        code = (b.code as string) ?? code;
      }
      title = HttpStatus[status] ?? 'Error';
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    if (status >= 500) this.logger.error(exception);

    res
      .status(status)
      .type('application/problem+json')
      .json({
        type: `about:blank`,
        title,
        status,
        code,
        detail,
        instance: req.originalUrl,
        errors,
      });
  }
}
