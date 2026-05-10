import { Inject, Injectable } from '@nestjs/common';
import type { IQuotationRepository } from '../../../domain/interfaces/quotation.repository.interface';
import { VoidResult } from '../../../domain/common/result';

@Injectable()
export class RejectQuotationUseCase {
  constructor(
    @Inject('IQuotationRepository')
    private readonly quotationRepository: IQuotationRepository,
  ) {}

  async execute(id: string): Promise<VoidResult> {
    const quotation = await this.quotationRepository.findById(id);
    if (!quotation)
      return VoidResult.failure('Cotización no encontrada.');

    const rejectResult = quotation.reject();
if (rejectResult.isFailure)
  return VoidResult.failure(rejectResult.error ?? 'Error al rechazar cotización.');

const rejected = rejectResult.value;
if (!rejected)
  return VoidResult.failure('Error al rechazar cotización.');

await this.quotationRepository.update(rejected);
return VoidResult.success();
  }
}