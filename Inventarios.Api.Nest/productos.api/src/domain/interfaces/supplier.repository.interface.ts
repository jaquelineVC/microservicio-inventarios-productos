import { SupplierDomain } from '../entities/supplier.entity';

export interface ISupplierRepository {
  findAll(): Promise<SupplierDomain[]>;
  findById(id: string): Promise<SupplierDomain | null>;
  existsByEmail(email: string): Promise<boolean>;
  save(supplier: SupplierDomain): Promise<void>;
  update(supplier: SupplierDomain): Promise<void>;
  delete(id: string): Promise<void>;
}