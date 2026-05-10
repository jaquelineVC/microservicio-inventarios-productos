import { ProductDomain } from '../entities/product.entity';

export interface IProductRepository {
  findAll(): Promise<ProductDomain[]>;
  findById(id: string): Promise<ProductDomain | null>;
  findBySku(sku: string): Promise<ProductDomain | null>;
  search(query: string, categoryId?: string): Promise<ProductDomain[]>;
  existsBySku(sku: string): Promise<boolean>;
  save(product: ProductDomain): Promise<void>;
  update(product: ProductDomain): Promise<void>;
  delete(id: string): Promise<void>;
}