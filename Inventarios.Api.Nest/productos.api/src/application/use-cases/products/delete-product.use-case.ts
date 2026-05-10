import { Inject, Injectable } from '@nestjs/common';
import type { IProductRepository } from '../../../domain/interfaces/product.repository.interface';
import { VoidResult } from '../../../domain/common/result';

@Injectable()
export class DeleteProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string): Promise<VoidResult> {
    const product = await this.productRepository.findById(id);
    if (!product)
      return VoidResult.failure('Producto no encontrado.');

    await this.productRepository.delete(id);
    return VoidResult.success();
  }
}