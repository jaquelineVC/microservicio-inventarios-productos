import { QuotationDomain } from '../entities/quotation.entity';

export interface IQuotationRepository {
  findAll(): Promise<QuotationDomain[]>;
  findById(id: string): Promise<QuotationDomain | null>;
  findByUserId(userId: string): Promise<QuotationDomain[]>;
  save(quotation: QuotationDomain): Promise<void>;
  update(quotation: QuotationDomain): Promise<void>;
  delete(id: string): Promise<void>;
}