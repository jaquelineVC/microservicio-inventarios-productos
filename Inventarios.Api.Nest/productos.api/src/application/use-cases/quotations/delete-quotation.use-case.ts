import { Inject, Injectable } from '@nestjs/common';
import type { IQuotationRepository } from '../../../domain/interfaces/quotation.repository.interface';
import { VoidResult } from '../../../domain/common/result';

@Injectable()
export class DeleteQuotationUseCase {
  constructor(
    @Inject('IQuotationRepository')
    private readonly quotationRepository: IQuotationRepository,
  ) {}

  async execute(id: string): Promise<VoidResult> {
    const quotation = await this.quotationRepository.findById(id);
    if (!quotation)
      return VoidResult.failure('Cotización no encontrada.');

    await this.quotationRepository.delete(id);
    return VoidResult.success();
  }
}