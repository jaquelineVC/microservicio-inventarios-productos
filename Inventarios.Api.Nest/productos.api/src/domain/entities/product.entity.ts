import { Result } from '../common/result';
import { Price } from '../value-objects/price.vo';
import { SKU } from '../value-objects/sku.vo';

// Objeto de parámetros — resuelve el problema de demasiados parámetros
export interface CreateProductParams {
  name: string;
  description: string;
  price: number;
  stock: number;
  sku: string;
  imageUrl: string;
  categoryId: string;
  supplierId: string;
}

export class ProductDomain {
  private constructor(
    readonly id: string,
    readonly name: string,
    readonly description: string,
    readonly price: number,
    readonly stock: number,
    readonly sku: string,
    readonly imageUrl: string,
    readonly categoryId: string,
    readonly supplierId: string,
    readonly isActive: boolean,
    readonly createdAt: Date,
    readonly updatedAt: Date,
  ) {}

 static create(params: CreateProductParams): Result<ProductDomain> {
    const { name, description, price, stock, sku, imageUrl, categoryId, supplierId } = params;

    if (!name || name.trim().length < 2)
      return Result.failure('El nombre del producto debe tener al menos 2 caracteres.');

    if (name.trim().length > 150)
      return Result.failure('El nombre no puede exceder 150 caracteres.');

    const priceResult = Price.create(price);
    if (priceResult.isFailure)
      return Result.failure(priceResult.error ?? 'Error en precio');

    const skuResult = SKU.create(sku);
    if (skuResult.isFailure)
      return Result.failure(skuResult.error ?? 'Error en SKU');

    if (stock < 0)
      return Result.failure('El stock no puede ser negativo.');

    if (!categoryId)
      return Result.failure('La categoría es requerida.');

    if (!supplierId)
      return Result.failure('El proveedor es requerido.');

    const now = new Date();

    // Usamos variables intermedias para evitar aserciones innecesarias
    const finalPrice = priceResult.value?.value ?? 0;
    const finalSku = skuResult.value?.value ?? '';

    return Result.success(
      new ProductDomain(
        crypto.randomUUID(),
        name.trim(),
        description?.trim() ?? '',
        finalPrice,
        stock,
        finalSku,
        imageUrl?.trim() ?? '',
        categoryId,
        supplierId,
        true,
        now,
        now,
      ),
    );
  }

  decrementStock(quantity: number): Result<ProductDomain> {
    if (quantity <= 0)
      return Result.failure('La cantidad debe ser mayor a cero.');

    if (this.stock < quantity)
      return Result.failure(`Stock insuficiente. Stock actual: ${this.stock}`);

    return Result.success(
      new ProductDomain(
        this.id, this.name, this.description, this.price,
        this.stock - quantity, this.sku, this.imageUrl,
        this.categoryId, this.supplierId, this.isActive,
        this.createdAt, new Date(),
      ),
    );
  }

  withUpdates(updates: Partial<{
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: string;
  supplierId: string;
}>): ProductDomain {
  return new (ProductDomain as any)(
    this.id,
    updates.name ?? this.name,
    updates.description ?? this.description,
    updates.price ?? this.price,
    updates.stock ?? this.stock,
    this.sku,
    updates.imageUrl ?? this.imageUrl,
    updates.categoryId ?? this.categoryId,
    updates.supplierId ?? this.supplierId,
    this.isActive,
    this.createdAt,
    new Date(),
  );
}
}