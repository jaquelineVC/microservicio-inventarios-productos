import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserOrmEntity } from '../../src/infrastructure/database/user.orm-entity';

export async function seedAdminUser(dataSource: DataSource): Promise<void> {
  const userRepo = dataSource.getRepository(UserOrmEntity);
  const passwordHash = bcrypt.hashSync('Admin@1234', 12);

  const existing = await userRepo.findOne({
    where: { email: 'admin@productos.com' },
  });

  if (existing) {
    // Resetea el bloqueo si existe
    await userRepo.update(existing.id, {
      failedLoginAttempts: 0,
      lockedUntil: null,
      isActive: true,
      passwordHash,
    });
  } else {
    const admin = userRepo.create({
      id: crypto.randomUUID(),
      name: 'Administrador',
      email: 'admin@productos.com',
      passwordHash,
      role: 'Admin',
      isActive: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      lastLoginAt: null,
    });
    await userRepo.save(admin);
  }
}