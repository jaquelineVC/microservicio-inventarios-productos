import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Servicio CQRS — Query Side.
 * Todas las lecturas van a la RÉPLICA.
 * Si la réplica no responde → NotFoundException (404) controlado.
 * NUNCA lanza un 500 que detenga el contenedor.
 */
@Injectable()
export class ReplicaQueryService {
  private readonly logger = new Logger(ReplicaQueryService.name);

  constructor(
    @InjectDataSource('replica')
    private readonly replicaDataSource: DataSource,
  ) {}

  /**
   * Ejecuta una query SELECT en la réplica.
   * Si la réplica está caída → 404 controlado.
   */
  async query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    try {
      if (!this.replicaDataSource.isInitialized) {
        this.logger.warn(
          '⚠️  Réplica no disponible. Retornando 404 controlado.'
        );
        throw new NotFoundException(
          'El servicio de consulta no está disponible temporalmente. ' +
          'Intenta de nuevo en unos momentos.'
        );
      }

      const result = await this.replicaDataSource.query(sql, params);
      return result as T[];

    } catch (error) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(
        '❌ Error al consultar réplica. ' +
        'Réplica posiblemente detenida.',
        error instanceof Error ? error.message : String(error),
      );

      // Nunca 500 — siempre 404 controlado
      throw new NotFoundException(
        'El servicio de consulta no está disponible. ' +
        'Por favor intenta más tarde.'
      );
    }
  }

  /**
   * Verifica si la réplica está disponible.
   */
  async isReplicaAvailable(): Promise<boolean> {
    try {
      await this.replicaDataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}