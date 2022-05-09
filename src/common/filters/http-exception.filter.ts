import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { STATUS_CODES } from 'http';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    const status: number = exception.getStatus();
    const exceptionMessage: any = exception.getResponse();

    const exceptionResponse = {
      path: request.url,
      exceptionType: 'Http Exception',
      timestamp: new Date().toISOString(),
      message: exceptionMessage.message,
    };

    const statusMessage = exceptionMessage.error ? `${status} - ${STATUS_CODES[status]} | ${exceptionResponse.message}` : `${status} - ${exceptionResponse.message}`;
    this.logger.error(`HttpException: ${statusMessage}`);

    response.status(status).json(exceptionResponse);
  }
}
