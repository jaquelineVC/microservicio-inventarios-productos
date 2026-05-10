import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { IClientRepository } from '../../domain/interfaces/client.repository.interface';
import { ClientDomain } from '../../domain/entities/client.entity';
import { ClientOrmEntity } from '../database/client.orm-entity';

@Injectable()
export class ClientRepository implements IClientRepository {
  constructor(
    @InjectRepository(ClientOrmEntity, 'master')
    private readonly repo: Repository<ClientOrmEntity>,
  ) {}

  async findAll(): Promise<ClientDomain[]> {
    const entities = await this.repo.find();
    return entities.map(e => this.toDomain(e));
  }

  async findById(id: string): Promise<ClientDomain | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.repo.exists({ where: { email } });
  }

  async save(client: ClientDomain): Promise<void> {
    await this.repo.save(this.toOrm(client));
  }

  async update(client: ClientDomain): Promise<void> {
    await this.repo.update(client.id, this.toOrm(client));
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(entity: ClientOrmEntity): ClientDomain {
    return Object.assign(Object.create(ClientDomain.prototype), {
      id: entity.id,
      name: entity.name,
      email: entity.email,
      phone: entity.phone,
      address: entity.address,
      createdAt: entity.createdAt,
    });
  }

  private toOrm(client: ClientDomain): ClientOrmEntity {
    const entity = new ClientOrmEntity();
    entity.id = client.id;
    entity.name = client.name;
    entity.email = client.email;
    entity.phone = client.phone;
    entity.address = client.address;
    entity.createdAt = client.createdAt;
    return entity;
  }
}