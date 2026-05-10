import { Inject, Injectable } from '@nestjs/common';
import type { IProductRepository } from '../../../domain/interfaces/product.repository.interface';
import { Result } from '../../../domain/common/result';
import { ProductResponse } from '../../../domain/dtos/responses/product.response';

@Injectable()
export class GetProductByIdUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string): Promise<Result<ProductResponse>> {
    const product = await this.productRepository.findById(id);

    if (!product)
      return Result.failure('Producto no encontrado.');

    const response = new ProductResponse();
    Object.assign(response, product);
    return Result.success(response);
  }
}