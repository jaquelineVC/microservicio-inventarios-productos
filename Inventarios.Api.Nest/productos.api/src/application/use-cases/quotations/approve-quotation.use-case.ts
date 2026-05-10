import { Inject, Injectable } from '@nestjs/common';
import type { IQuotationRepository } from '../../../domain/interfaces/quotation.repository.interface';
import { VoidResult } from '../../../domain/common/result';

@Injectable()
export class ApproveQuotationUseCase {
  constructor(
    @Inject('IQuotationRepository')
    private readonly quotationRepository: IQuotationRepository,
  ) {}

  async execute(id: string): Promise<VoidResult> {
    const quotation = await this.quotationRepository.findById(id);
    if (!quotation)
      return VoidResult.failure('Cotización no encontrada.');

    const approveResult = quotation.approve();
    if (approveResult.isFailure)
       return VoidResult.failure(approveResult.error ?? 'Error al aprobar cotización.');

    const approved = approveResult.value;
if (!approved)
  return VoidResult.failure('Error al aprobar cotización.');

await this.quotationRepository.update(approved);
return VoidResult.success();
  }
}