import {
  Entity, PrimaryColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn
} from 'typeorm';
import { CategoryOrmEntity } from './category.orm-entity';
import { SupplierOrmEntity } from './supplier.orm-entity';

@Entity('products')
export class ProductOrmEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ type: 'text', default: '' })
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column({ default: 0 })
  stock!: number;

  @Column({ unique: true, length: 50 })
  sku!: string;

  @Column({ name: 'image_url', length: 500, default: '' })
  imageUrl!: string;

  @Column({ name: 'category_id', type: 'char', length: 36 })
  categoryId!: string;

  @Column({ name: 'supplier_id', type: 'char', length: 36 })
  supplierId!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Sin inversa — evita referencia circular
  @ManyToOne(() => CategoryOrmEntity)
  @JoinColumn({ name: 'category_id' })
  category!: CategoryOrmEntity;

  @ManyToOne(() => SupplierOrmEntity)
  @JoinColumn({ name: 'supplier_id' })
  supplier!: SupplierOrmEntity;
}