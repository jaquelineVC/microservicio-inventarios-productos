import { Inject, Injectable } from '@nestjs/common';
import type { ICategoryRepository } from '../../../domain/interfaces/category.repository.interface';
import { Result } from '../../../domain/common/result';
import { CategoryResponse } from '../../../domain/dtos/responses/category.response';

@Injectable()
export class GetAllCategoriesUseCase {
  constructor(
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
  ) {}

  async execute(): Promise<Result<CategoryResponse[]>> {
    const categories = await this.categoryRepository.findAll();
    const response = categories.map(c => Object.assign(new CategoryResponse(), c));
    return Result.success(response);
  }
}