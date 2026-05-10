import { UserDomain } from '../entities/user.entity';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserDomain | null>;
  findById(id: string): Promise<UserDomain | null>;
  existsByEmail(email: string): Promise<boolean>;
  save(user: UserDomain): Promise<void>;
  update(user: UserDomain): Promise<void>;
}