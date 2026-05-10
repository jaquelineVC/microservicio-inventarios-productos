import {
  Injectable, NestInterceptor, ExecutionContext,
  CallHandler, Logger,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';

/**
 * Cross Cutting — Logging centralizado.
 * Intercepta TODOS los requests y responses automáticamente.
 * Registra: método, ruta, tiempo de respuesta, status.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] ?? 'unknown';
    const startTime = Date.now();

    // Log de entrada
    this.logger.log(
      `→ ${method} ${url} | IP: ${ip} | Agent: ${userAgent.slice(0, 50)}`
    );

    return next.handle().pipe(
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const duration = Date.now() - startTime;

        this.logger.log(
          `← ${method} ${url} | Status: ${response.statusCode} | ${duration}ms`
        );
      }),
      catchError(error => {
        const duration = Date.now() - startTime;
        this.logger.error(
          `✗ ${method} ${url} | Error: ${error.message} | ${duration}ms`
        );
        return throwError(() => error);
      }),
    );
  }
}