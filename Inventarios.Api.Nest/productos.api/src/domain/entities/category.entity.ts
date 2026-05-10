import { Result } from '../common/result';

export class CategoryDomain {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string,
    readonly createdAt: Date,
  ) {}

  static create(name: string, description: string): Result<CategoryDomain> {
    if (!name || name.trim().length < 2)
      return Result.failure('El nombre de la categoría debe tener al menos 2 caracteres.');

    if (name.trim().length > 100)
      return Result.failure('El nombre no puede exceder 100 caracteres.');

    return Result.success(
      new CategoryDomain(
        crypto.randomUUID(),
        name.trim(),
        description?.trim() ?? '',
        new Date(),
      ),
    );
  }
}