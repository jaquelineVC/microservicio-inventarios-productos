import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ISupplierRepository } from '../../domain/interfaces/supplier.repository.interface';
import { SupplierDomain } from '../../domain/entities/supplier.entity';
import { SupplierOrmEntity } from '../database/supplier.orm-entity';

@Injectable()
export class SupplierRepository implements ISupplierRepository {
  constructor(
    @InjectRepository(SupplierOrmEntity, 'master')
    private readonly repo: Repository<SupplierOrmEntity>,
  ) {}

  async findAll(): Promise<SupplierDomain[]> {
    const entities = await this.repo.find();
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<SupplierDomain | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.repo.exists({ where: { email } });
  }

  async save(supplier: SupplierDomain): Promise<void> {
    await this.repo.save(this.toOrm(supplier));
  }

  async update(supplier: SupplierDomain): Promise<void> {
    await this.repo.update(supplier.id, this.toOrm(supplier));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(entity: SupplierOrmEntity): SupplierDomain {
    return Object.assign(Object.create(SupplierDomain.prototype), {
      id: entity.id,
      name: entity.name,
      phone: entity.phone,
      email: entity.email,
      address: entity.address,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    });
  }

  private toOrm(supplier: SupplierDomain): SupplierOrmEntity {
    const entity = new SupplierOrmEntity();
    entity.id = supplier.id;
    entity.name = supplier.name;
    entity.phone = supplier.phone;
    entity.email = supplier.email;
    entity.address = supplier.address;
    entity.isActive = supplier.isActive;
    entity.createdAt = supplier.createdAt;
    return entity;
  }
}