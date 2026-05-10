import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { ICategoryRepository } from '../../domain/interfaces/category.repository.interface';
import { CategoryDomain } from '../../domain/entities/category.entity';
import { CategoryOrmEntity } from '../database/category.orm-entity';

@Injectable()
export class CategoryRepository implements ICategoryRepository {
  constructor(
    @InjectRepository(CategoryOrmEntity, 'master')
    private readonly repo: Repository<CategoryOrmEntity>,
  ) {}

  async findAll(): Promise<CategoryDomain[]> {
    const entities = await this.repo.find();
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<CategoryDomain | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async existsByName(name: string): Promise<boolean> {
    return this.repo.exists({ where: { name } });
  }

  async save(category: CategoryDomain): Promise<void> {
    const entity = this.toOrm(category);
    await this.repo.save(entity);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(entity: CategoryOrmEntity): CategoryDomain {
    return Object.assign(Object.create(CategoryDomain.prototype), {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      createdAt: entity.createdAt,
    });
  }

  private toOrm(category: CategoryDomain): CategoryOrmEntity {
    const entity = new CategoryOrmEntity();
    entity.id = category.id;
    entity.name = category.name;
    entity.description = category.description;
    entity.createdAt = category.createdAt;
    return entity;
  }

  async update(category: CategoryDomain): Promise<void> {
  await this.repo.update(category.id, {
    name: category.name,
    description: category.description,
  });
}
}