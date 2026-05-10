import { Inject, Injectable } from '@nestjs/common';
import type { ICategoryRepository } from '../../../domain/interfaces/category.repository.interface';
import { Result } from '../../../domain/common/result';
import { CreateCategoryRequest } from '../../../domain/dtos/requests/create-category.request';
import { CategoryDomain } from '../../../domain/entities/category.entity';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(request: CreateCategoryRequest): Promise<Result<string>> {
    const exists = await this.categoryRepository.existsByName(request.name);
    if (exists)
      return Result.failure('Ya existe una categoría con ese nombre.');

    const categoryResult = CategoryDomain.create(
      request.name,
      request.description ?? '',
    );

    

const category = categoryResult.value;
if (!category)
  return Result.failure('Error al crear categoría.');
await this.categoryRepository.save(category);
return Result.success(category.id);
  }
}