import { Inject, Injectable } from '@nestjs/common';
import type { IProductRepository } from '../../../domain/interfaces/product.repository.interface';
import type { ICategoryRepository } from '../../../domain/interfaces/category.repository.interface';
import type { ISupplierRepository } from '../../../domain/interfaces/supplier.repository.interface';
import { Result } from '../../../domain/common/result';
import { CreateProductRequest } from '../../../domain/dtos/requests/create-product.request';
import { ProductDomain } from '../../../domain/entities/product.entity';

@Injectable()
export class CreateProductUseCase {
  constructor(
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('ICategoryRepository')
    private readonly categoryRepository: ICategoryRepository,
    @Inject('ISupplierRepository')
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  async execute(request: CreateProductRequest): Promise<Result<string>> {
    const skuExists = await this.productRepository.existsBySku(request.sku);
    if (skuExists)
      return Result.failure('Ya existe un producto con ese SKU.');

    const category = await this.categoryRepository.findById(request.categoryId);
    if (!category)
      return Result.failure('La categoría no existe.');

    const supplier = await this.supplierRepository.findById(request.supplierId);
    if (!supplier)
      return Result.failure('El proveedor no existe.');

    const productResult = ProductDomain.create({
      name: request.name,
      description: request.description ?? '',
      price: request.price,
      stock: request.stock,
      sku: request.sku,
      imageUrl: request.imageUrl ?? '',
      categoryId: request.categoryId,
      supplierId: request.supplierId,
    });

    if (productResult.isFailure)
      return Result.failure(productResult.error ?? 'Error al crear producto.');

    await this.productRepository.save(productResult.value!);
    return Result.success(productResult.value!.id);
  }
}