import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

@Catch()
export class FallbackFilter implements ExceptionFilter {
  private readonly logger = new Logger(FallbackFilter.name);

  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();
    // All fallback errors should result in a Http Error Code 500
    const status = HttpStatus.INTERNAL_SERVER_ERROR;

    // IExceptionResponse = {

    const exceptionResponse: any = {
      serviceId: 2,
      path: request.url || null,
      exceptionType: 'Fallback exception',
      timestamp: new Date().toISOString(),
      message: `An unexpected error occurred.`,
    };

    const exceptionLogsMessage = exception.message ? exception.message : `An Unexpected error occurred.`;

    this.logger.error(`Fallback Exception: ${exceptionLogsMessage}`);
    this.logger.debug(`Stack details:\n ${exception.stack}`);

    response.status(status).json(exceptionResponse);
  }
}
