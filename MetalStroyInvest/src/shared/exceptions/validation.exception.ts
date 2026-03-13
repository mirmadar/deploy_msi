import { HttpException, HttpStatus } from '@nestjs/common';

export class ValidationException extends HttpException {
  constructor(public readonly messages: Record<string, string>) {
    const message = Object.entries(messages)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    super(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: message || 'Validation failed',
        error: 'Bad Request',
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
