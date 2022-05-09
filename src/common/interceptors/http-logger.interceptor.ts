import { CallHandler, ExecutionContext, HttpException, HttpStatus, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { randomUUID } from 'crypto';
import { STATUS_CODES } from 'http';

@Injectable()
/**
 * HTTP logger Interceptor - Logs incoming requests, successful and failed server responses
 */
export class HttpLoggerInterceptor implements NestInterceptor {
  private logger = new Logger(HttpLoggerInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpRequestUUID = randomUUID();

    const dateNow = Date.now();
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.originalUrl;

    //console.log(`${response.statusCode} | [${method}] ${url} - ${delay}ms`);
    // Http request log here
    this.logger.log(`[uuid: ${httpRequestUUID}] [method: ${method}] [path: ${url}] [message: Started Request]`);

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const elapsedTimeMilliseconds = Date.now() - dateNow;

        // Successful response log here
        const statusMessage = `${response.statusCode} - ${STATUS_CODES[response.statusCode]} | ${elapsedTimeMilliseconds}ms`;
        this.logger.log(`[uuid: ${httpRequestUUID}] [method: ${method}] [path: ${url}] [message: Server response: ${statusMessage}] [elapsedTime:${elapsedTimeMilliseconds}ms]`);
      }),
      catchError((error) => {
        let statusCode = HttpStatus.INTERNAL_SERVER_ERROR; // Default status code

        if (error instanceof HttpException) {
          statusCode = error.getStatus();
        }

        const elapsedTimeMilliseconds = Date.now() - dateNow;

        // Failed response log here
        const statusMessage = `${statusCode} - ${STATUS_CODES[statusCode]} | ${elapsedTimeMilliseconds}ms`;
        this.logger.error(`[uuid: ${httpRequestUUID}] [method: ${method}] [path: ${url}] [message: Server response: ${statusMessage}] [elapsedTime:${elapsedTimeMilliseconds}ms]`);

        return throwError(() => error);
      })
    );
  }
}
