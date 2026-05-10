import { Inject, Injectable } from '@nestjs/common';
import type { ISupplierRepository } from '../../../domain/interfaces/supplier.repository.interface';
import { Result } from '../../../domain/common/result';
import { SupplierResponse } from '../../../domain/dtos/responses/supplier.response';

@Injectable()
export class GetAllSuppliersUseCase {
  constructor(
    @Inject('ISupplierRepository')
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  async execute(): Promise<Result<SupplierResponse[]>> {
    const suppliers = await this.supplierRepository.findAll();
    const response = suppliers.map(s => Object.assign(new SupplierResponse(), s));
    return Result.success(response);
  }
}