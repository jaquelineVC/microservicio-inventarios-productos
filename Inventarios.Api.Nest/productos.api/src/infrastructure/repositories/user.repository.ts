import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IUserRepository } from '../../domain/interfaces/user.repository.interface';
import { UserDomain, UserRole } from '../../domain/entities/user.entity';
import { UserOrmEntity } from '../database/user.orm-entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserOrmEntity, 'master')
private readonly repo: Repository<UserOrmEntity>,
  ) {}

  async findByEmail(email: string): Promise<UserDomain | null> {
    const entity = await this.repo.findOne({
      where: { email: email.toLowerCase() },
    });
    return entity ? this.toDomain(entity) : null;
  }

  async findById(id: string): Promise<UserDomain | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.repo.exists({ where: { email: email.toLowerCase() } });
  }

  async save(user: UserDomain): Promise<void> {
    const entity = this.toOrm(user);
    await this.repo.save(entity);
  }

  async update(user: UserDomain): Promise<void> {
    await this.repo.update(user.id, {
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil,
      lastLoginAt: user.lastLoginAt,
      isActive: user.isActive,
    });
  }

  private toDomain(entity: UserOrmEntity): UserDomain {
    return Object.assign(
      Object.create(UserDomain.prototype),
      {
        id: entity.id,
        name: entity.name,
        email: entity.email,
        passwordHash: entity.passwordHash,
        role: entity.role as UserRole,
        isActive: entity.isActive,
        createdAt: entity.createdAt,
        failedLoginAttempts: entity.failedLoginAttempts,
        lockedUntil: entity.lockedUntil,
        lastLoginAt: entity.lastLoginAt,
      },
    );
  }

  private toOrm(user: UserDomain): UserOrmEntity {
    const entity = new UserOrmEntity();
    entity.id = user.id;
    entity.name = user.name;
    entity.email = user.email;
    entity.passwordHash = user.passwordHash;
    entity.role = user.role;
    entity.isActive = user.isActive;
    entity.createdAt = user.createdAt;
    entity.failedLoginAttempts = user.failedLoginAttempts;
    entity.lockedUntil = user.lockedUntil;
    entity.lastLoginAt = user.lastLoginAt;
    return entity;
  }
}