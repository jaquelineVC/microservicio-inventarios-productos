import { Inject, Injectable } from '@nestjs/common';
import type { IQuotationRepository } from '../../../domain/interfaces/quotation.repository.interface';
import { Result } from '../../../domain/common/result';
import { QuotationResponse } from '../../../domain/dtos/responses/quotation.response';

@Injectable()
export class GetMyQuotationsUseCase {
  constructor(
    @Inject('IQuotationRepository')
    private readonly quotationRepository: IQuotationRepository,
  ) {}

  async execute(userId: string): Promise<Result<QuotationResponse[]>> {
    const quotations = await this.quotationRepository.findByUserId(userId);
    const response = quotations.map(q => Object.assign(new QuotationResponse(), q));
    return Result.success(response);
  }
}