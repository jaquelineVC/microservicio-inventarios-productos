import { Inject, Injectable } from '@nestjs/common';
import type { IProductRepository } from '../../../domain/interfaces/product.repository.interface';
import { Result } from '../../../domain/common/result';
import { ProductResponse } from '../../../domain/dtos/responses/product.response';

@Injectable()
export class SearchProductsUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(query: string, categoryId?: string): Promise<Result<ProductResponse[]>> {
    if (!query || query.trim().length < 2)
      return Result.failure('El término de búsqueda debe tener al menos 2 caracteres.');

    const products = await this.productRepository.search(query.trim(), categoryId);
    const response = products.map(p => Object.assign(new ProductResponse(), p));
    return Result.success(response);
  }
}