import type { CategoryDomain } from '../entities/category.entity';

export interface ICategoryRepository {
  findAll(): Promise<CategoryDomain[]>;
  findById(id: string): Promise<CategoryDomain | null>;
  existsByName(name: string): Promise<boolean>;
  save(category: CategoryDomain): Promise<void>;
  update(category: CategoryDomain): Promise<void>;
  delete(id: string): Promise<void>;
}