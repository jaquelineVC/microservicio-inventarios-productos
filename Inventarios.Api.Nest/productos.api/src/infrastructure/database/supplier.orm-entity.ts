import {
  Entity, PrimaryColumn, Column,
  CreateDateColumn
} from 'typeorm';

@Entity('suppliers')
export class SupplierOrmEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ length: 20 })
  phone!: string;

  @Column({ unique: true, length: 254 })
  email!: string;

  @Column({ length: 255, default: '' })
  address!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

}