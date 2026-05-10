import { Inject, Injectable } from '@nestjs/common';
import type { IProductRepository } from '../../../domain/interfaces/product.repository.interface';
import { Result } from '../../../domain/common/result';
import { ProductResponse } from '../../../domain/dtos/responses/product.response';

@Injectable()
export class GetAllProductsUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
  ) {}

  async execute(): Promise<Result<ProductResponse[]>> {
    const products = await this.productRepository.findAll();
    const response = products.map(p => this.toResponse(p));
    return Result.success(response);
  }

  private toResponse(p: any): ProductResponse {
    const response = new ProductResponse();
    response.id = p.id;
    response.name = p.name;
    response.description = p.description;
    response.price = p.price;
    response.stock = p.stock;
    response.sku = p.sku;
    response.imageUrl = p.imageUrl;
    response.categoryId = p.categoryId;
    response.categoryName = p.categoryName ?? '';
    response.supplierId = p.supplierId;
    response.supplierName = p.supplierName ?? '';
    response.isActive = p.isActive;
    response.createdAt = p.createdAt;
    response.updatedAt = p.updatedAt;
    return response;
  }
}