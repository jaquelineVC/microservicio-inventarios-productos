import {
  Entity, PrimaryColumn, Column,
  CreateDateColumn
} from 'typeorm';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({ unique: true, length: 254 })
  email!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: ['Admin', 'Empleado'],
    default: 'Empleado',
  })
  role!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'failed_login_attempts', default: 0 })
  failedLoginAttempts!: number;

  @Column({ name: 'locked_until', nullable: true, type: 'datetime' })
  lockedUntil!: Date | null;

  @Column({ name: 'last_login_at', nullable: true, type: 'datetime' })
  lastLoginAt!: Date | null;
}