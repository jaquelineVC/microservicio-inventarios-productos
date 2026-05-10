import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IPasswordHasher } from '../../application/use-cases/auth/login.use-case';

@Injectable()
export class PasswordHasherService implements IPasswordHasher {
  private readonly saltRounds = 12;

  hash(password: string): string {
    return bcrypt.hashSync(password, this.saltRounds);
  }

  verify(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }
}