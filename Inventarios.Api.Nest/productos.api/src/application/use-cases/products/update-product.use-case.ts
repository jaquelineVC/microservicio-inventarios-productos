import { Inject, Injectable } from '@nestjs/common';
import type { IProductRepository } from '../../../domain/interfaces/product.repository.interface';
import { VoidResult } from '../../../domain/common/result';
import type { UpdateProductRequest } from '../../../domain/dtos/requests/update-product.request';

@Injectable()
export class UpdateProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(id: string, request: UpdateProductRequest): Promise<VoidResult> {
    const product = await this.productRepository.findById(id);
    if (!product)
      return VoidResult.failure('Producto no encontrado.');

    const updated = product.withUpdates({
      name: request.name,
      description: request.description,
      price: request.price,
      stock: request.stock,
      imageUrl: request.imageUrl,
      categoryId: request.categoryId,
      supplierId: request.supplierId,
    });

    await this.productRepository.update(updated);
    return VoidResult.success();
  }
}