import {
  Entity, PrimaryColumn, Column,
  CreateDateColumn
} from 'typeorm';

@Entity('categories')
export class CategoryOrmEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ unique: true, length: 100 })
  name!: string;

  @Column({ length: 255, default: '' })
  description!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}