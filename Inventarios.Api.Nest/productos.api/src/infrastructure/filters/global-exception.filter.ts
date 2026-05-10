import {
  ExceptionFilter, Catch, ArgumentsHost,
  HttpException, HttpStatus, Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Cross Cutting — Manejo de errores global.
 * Captura TODAS las excepciones y devuelve respuesta consistente.
 * NUNCA deja tronar el contenedor con un error 500 sin manejar.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  // Patrones maliciosos para detectar en errores
  private readonly maliciousPatterns = [
    'DROP ', 'DELETE FROM', 'INSERT INTO',
    '<script', 'javascript:', '--', 'UNION SELECT',
  ];

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor.';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string'
        ? exceptionResponse
        : (exceptionResponse as any).message ?? message;
    } else if (exception instanceof Error) {
      // Detectar si el error contiene patrones maliciosos
      if (this.containsMaliciousPattern(exception.message)) {
        this.logger.warn(
          `ALERTA SEGURIDAD: Posible ataque detectado en request ` +
          `${request.method} ${request.url} | IP: ${request.ip}`
        );
        status = HttpStatus.BAD_REQUEST;
        message = 'Solicitud inválida.';
      } else {
        this.logger.error(
          `Error no manejado: ${exception.message}`,
          exception.stack,
        );
      }
    }

    // Respuesta siempre consistente — nunca expone detalles internos
    response.status(status).json({
      success: false,
      message,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }

  private containsMaliciousPattern(input: string): boolean {
    if (!input) return false;
    const upper = input.toUpperCase();
    return this.maliciousPatterns.some(p => upper.includes(p.toUpperCase()));
  }
}