import { Inject, Injectable } from '@nestjs/common';
import type { ICategoryRepository } from '../../../domain/interfaces/category.repository.interface';
import { VoidResult } from '../../../domain/common/result';

@Injectable()
export class DeleteCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(id: string): Promise<VoidResult> {
    const category = await this.categoryRepository.findById(id);
    if (!category)
      return VoidResult.failure('Categoría no encontrada.');

    await this.categoryRepository.delete(id);
    return VoidResult.success();
  }
}