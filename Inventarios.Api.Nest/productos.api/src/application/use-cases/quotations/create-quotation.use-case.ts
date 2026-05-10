import { Inject, Injectable } from '@nestjs/common';
import type { IQuotationRepository } from '../../../domain/interfaces/quotation.repository.interface';
import type { IProductRepository } from '../../../domain/interfaces/product.repository.interface';
import type { IClientRepository } from '../../../domain/interfaces/client.repository.interface';
import { Result } from '../../../domain/common/result';
import type { CreateQuotationRequest } from '../../../domain/dtos/requests/create-quotation.request';
import { QuotationDomain } from '../../../domain/entities/quotation.entity';
import type { QuotationItem } from '../../../domain/entities/quotation.entity';

@Injectable()
export class CreateQuotationUseCase {
  constructor(
    @Inject('IQuotationRepository')
    private readonly quotationRepository: IQuotationRepository,
    @Inject('IProductRepository')
    private readonly productRepository: IProductRepository,
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(request: CreateQuotationRequest, userId: string): Promise<Result<string>> {
    const client = await this.clientRepository.findById(request.clientId);
    if (!client)
      return Result.failure('El cliente no existe.');

    // Tipado explícito del array — resuelve el error 'never[]'
    const items: QuotationItem[] = [];

    for (const item of request.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product)
        return Result.failure(`Producto con ID ${item.productId} no encontrado.`);

      items.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.quantity * item.unitPrice,
      });
    }

    const quotationResult = QuotationDomain.create(request.clientId, userId, items);

    if (quotationResult.isFailure)
      return Result.failure(quotationResult.error ?? 'Error al crear cotización.');

    const quotation = quotationResult.value;
    if (!quotation)
      return Result.failure('Error al crear cotización.');

    await this.quotationRepository.save(quotation);
    return Result.success(quotation.id);
  }
}