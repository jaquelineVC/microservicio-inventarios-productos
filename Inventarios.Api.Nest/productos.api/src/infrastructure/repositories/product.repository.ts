import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import type { IProductRepository } from '../../domain/interfaces/product.repository.interface';
import { ProductDomain } from '../../domain/entities/product.entity';
import { ProductOrmEntity } from '../database/product.orm-entity';

@Injectable()
export class ProductRepository implements IProductRepository {
  constructor(
    @InjectRepository(ProductOrmEntity,'master')
    private readonly repo: Repository<ProductOrmEntity>,
  ) {}

  async findAll(): Promise<ProductDomain[]> {
    const entities = await this.repo.find({
      relations: ['category', 'supplier'],
    });
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<ProductDomain | null> {
    const entity = await this.repo.findOne({
      where: { id },
      relations: ['category', 'supplier'],
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findBySku(sku: string): Promise<ProductDomain | null> {
    const entity = await this.repo.findOne({ where: { sku } });
    return entity ? this.toDomain(entity) : null;
  }

  async search(query: string, categoryId?: string): Promise<ProductDomain[]> {
    const where: any = [
      { name: Like(`%${query}%`) },
      { sku: Like(`%${query}%`) },
    ];

    if (categoryId) {
      where.forEach((w: any) => { w.categoryId = categoryId; });
    }

    const entities = await this.repo.find({
      where,
      relations: ['category', 'supplier'],
    });
    return entities.map(e => this.toDomain(e));
  }

  async existsBySku(sku: string): Promise<boolean> {
    return this.repo.exists({ where: { sku } });
  }

  async save(product: ProductDomain): Promise<void> {
    await this.repo.save(this.toOrm(product));
  }

  async update(product: ProductDomain): Promise<void> {
    await this.repo.update(product.id, this.toOrm(product));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(entity: ProductOrmEntity): ProductDomain {
    return Object.assign(Object.create(ProductDomain.prototype), {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      price: Number(entity.price),
      stock: entity.stock,
      sku: entity.sku,
      imageUrl: entity.imageUrl,
      categoryId: entity.categoryId,
      categoryName: entity.category?.name ?? '',
      supplierId: entity.supplierId,
      supplierName: entity.supplier?.name ?? '',
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  private toOrm(product: ProductDomain): ProductOrmEntity {
    const entity = new ProductOrmEntity();
    entity.id = product.id;
    entity.name = product.name;
    entity.description = product.description;
    entity.price = product.price;
    entity.stock = product.stock;
    entity.sku = product.sku;
    entity.imageUrl = product.imageUrl;
    entity.categoryId = product.categoryId;
    entity.supplierId = product.supplierId;
    entity.isActive = product.isActive;
    entity.createdAt = product.createdAt;
    entity.updatedAt = product.updatedAt;
    return entity;
  }
}