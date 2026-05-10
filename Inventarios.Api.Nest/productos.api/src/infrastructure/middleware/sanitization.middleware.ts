import { Injectable, NestMiddleware, BadRequestException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * Sanitiza el body de los requests para prevenir XSS, HTML Injection y Script Injection.
 */
@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  private static readonly scriptPattern =
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi;

  private static readonly eventHandlerPattern = /\bon\w+\s*=/gi;

  use(req: Request, res: Response, next: NextFunction) {
    if (req.body && typeof req.body === 'object') {
      const body = JSON.stringify(req.body);
      if (this.containsMaliciousContent(body)) {
        throw new BadRequestException(
          'El contenido de la solicitud contiene caracteres no permitidos.',
        );
      }
    }
    next();
  }

  private containsMaliciousContent(content: string): boolean {
    return (
      SanitizationMiddleware.scriptPattern.test(content) ||
      SanitizationMiddleware.eventHandlerPattern.test(content) ||
      content.toLowerCase().includes('javascript:') ||
      content.toLowerCase().includes('vbscript:') ||
      content.toLowerCase().includes('data:text/html')
    );
  }
}