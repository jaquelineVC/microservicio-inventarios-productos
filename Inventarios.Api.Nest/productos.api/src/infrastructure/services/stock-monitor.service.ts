import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductOrmEntity } from '../database/product.orm-entity';

/**
 * Servicio de segundo plano — Verificador de Stock Crítico.
 * Lee de la RÉPLICA (solo SELECT) cada 5 minutos.
 * Si la réplica no responde, loguea el error pero NUNCA tira el contenedor.
 */
@Injectable()
export class StockMonitorService {
  private readonly logger = new Logger(StockMonitorService.name);
  private readonly CRITICAL_STOCK_THRESHOLD = 5;

  // Patrones maliciosos a detectar en datos
  private readonly maliciousPatterns = [
    '--', ';--', '/*', '*/', 'DROP ', 'DELETE ',
    'INSERT ', 'UPDATE ', 'UNION ', 'SELECT ',
    '1=1', 'OR 1', '<script', 'javascript:', 'EXEC ',
  ];

  constructor(
    @InjectRepository(ProductOrmEntity, 'replica')
    private readonly productRepo: Repository<ProductOrmEntity>,
  ) {}

  /**
   * Se ejecuta cada 5 minutos automáticamente.
   * Lee de la réplica — solo consultas SELECT.
   */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async checkCriticalStock(): Promise<void> {
    this.logger.log(
      `🔄 [${new Date().toISOString()}] Iniciando verificación de stock crítico...`
    );

    try {
      const criticalProducts = await this.productRepo.find({
        where: { isActive: true },
        select: ['id', 'name', 'sku', 'stock'],
      });

      let alertCount = 0;
      let maliciousCount = 0;

      for (const product of criticalProducts) {
        // Detectar datos maliciosos antes de procesar
        if (this.containsMaliciousPattern(product.name) ||
            this.containsMaliciousPattern(product.sku)) {
          this.logger.warn(
            `ALERTA SEGURIDAD: Datos maliciosos detectados en producto ` +
            `ID: ${product.id}. Descartado sin procesar.`
          );
          maliciousCount++;
          continue; // Descartar — no procesar
        }

        if (product.stock < this.CRITICAL_STOCK_THRESHOLD) {
          this.logger.warn(
            `ALERTA REABASTECIMIENTO: Producto "${product.name}" ` +
            `(SKU: ${product.sku}) tiene stock crítico: ${product.stock} unidades.`
          );
          alertCount++;
        }
      }

      this.logger.log(
        `Verificación completada. ` +
        `Alertas: ${alertCount} | Maliciosos detectados: ${maliciousCount}`
      );

    } catch (error) {
      // NUNCA dejar tronar el contenedor
      // Si la réplica está caída — log controlado, no excepción
      this.logger.error(
        `Error al verificar stock. La réplica puede estar caída. ` +
        `El servicio continuará en el próximo ciclo.`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * Detecta patrones de SQL Injection y ataques en strings.
   */
  private containsMaliciousPattern(input: string): boolean {
    if (!input) return false;
    const upperInput = input.toUpperCase();
    return this.maliciousPatterns.some(pattern =>
      upperInput.includes(pattern.toUpperCase())
    );
  }
}