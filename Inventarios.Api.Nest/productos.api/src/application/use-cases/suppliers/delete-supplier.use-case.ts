import { Inject, Injectable } from '@nestjs/common';
import type { ISupplierRepository } from '../../../domain/interfaces/supplier.repository.interface';
import { VoidResult } from '../../../domain/common/result';

@Injectable()
export class DeleteSupplierUseCase {
  constructor(
    @Inject('ISupplierRepository')
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  async execute(id: string): Promise<VoidResult> {
    const supplier = await this.supplierRepository.findById(id);
    if (!supplier)
      return VoidResult.failure('Proveedor no encontrado.');

    await this.supplierRepository.delete(id);
    return VoidResult.success();
  }
}