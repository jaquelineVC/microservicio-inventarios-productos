import {
  Entity, PrimaryColumn, Column,
  CreateDateColumn
} from 'typeorm';

@Entity('clients')
export class ClientOrmEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ length: 150 })
  name!: string;

  @Column({ unique: true, length: 254 })
  email!: string;

  @Column({ length: 20, default: '' })
  phone!: string;

  @Column({ length: 255, default: '' })
  address!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}