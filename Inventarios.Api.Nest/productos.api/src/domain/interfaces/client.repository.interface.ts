import { ClientDomain } from '../entities/client.entity';

export interface IClientRepository {
  findAll(): Promise<ClientDomain[]>;
  findById(id: string): Promise<ClientDomain | null>;
  existsByEmail(email: string): Promise<boolean>;
  save(client: ClientDomain): Promise<void>;
  update(client: ClientDomain): Promise<void>;
  delete(id: string): Promise<void>;
}