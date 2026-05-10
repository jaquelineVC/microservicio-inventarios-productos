import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IQuotationRepository } from '../../domain/interfaces/quotation.repository.interface';
import { QuotationDomain, QuotationStatus } from '../../domain/entities/quotation.entity';
import type { QuotationItem } from '../../domain/entities/quotation.entity';
import { QuotationOrmEntity } from '../database/quotation.orm-entity';

@Injectable()
export class QuotationRepository implements IQuotationRepository {
  constructor(
    @InjectRepository(QuotationOrmEntity,'master')
    private readonly repo: Repository<QuotationOrmEntity>,
  ) {}

  async findAll(): Promise<QuotationDomain[]> {
    const entities = await this.repo.find({
      relations: ['client', 'user'],
    });
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<QuotationDomain | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['client', 'user'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findByUserId(userId: string): Promise<QuotationDomain[]> {
    const entities = await this.repo.find({
      where: { userId },
      relations: ['client', 'user'],
    });
    return entities.map(e => this.toDomain(e));
  }

  async save(quotation: QuotationDomain): Promise<void> {
    await this.repo.save(this.toOrm(quotation));
  }

  async update(quotation: QuotationDomain): Promise<void> {
    await this.repo.update(quotation.id, {
      status: quotation.status,
      updatedAt: quotation.updatedAt,
    });
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(entity: QuotationOrmEntity): QuotationDomain {
    return Object.assign(Object.create(QuotationDomain.prototype), {
      id: entity.id,
      clientId: entity.clientId,
      clientName: entity.client?.name ?? '',
      userId: entity.userId,
      userName: entity.user?.name ?? '',
      items: entity.items as QuotationItem[],
      total: Number(entity.total),
      status: entity.status as QuotationStatus,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toOrm(quotation: QuotationDomain): QuotationOrmEntity {
    const entity = new QuotationOrmEntity();
    entity.id = quotation.id;
    entity.clientId = quotation.clientId;
    entity.userId = quotation.userId;
    entity.items = quotation.items;
    entity.total = quotation.total;
    entity.status = quotation.status;
    entity.createdAt = quotation.createdAt;
    entity.updatedAt = quotation.updatedAt;
    return entity;
  }
}