import { Inject, Injectable } from '@nestjs/common';
import type { ISupplierRepository } from '../../../domain/interfaces/supplier.repository.interface';
import { Result } from '../../../domain/common/result';
import { CreateSupplierRequest } from '../../../domain/dtos/requests/create-supplier.request';
import { SupplierDomain } from '../../../domain/entities/supplier.entity';

@Injectable()
export class CreateSupplierUseCase {
  constructor(
    @Inject('ISupplierRepository')
    private readonly supplierRepository: ISupplierRepository,
  ) {}

  async execute(request: CreateSupplierRequest): Promise<Result<string>> {
    const exists = await this.supplierRepository.existsByEmail(request.email);
    if (exists)
      return Result.failure('Ya existe un proveedor con ese email.');

    const supplierResult = SupplierDomain.create(
      request.name,
      request.phone,
      request.email,
      request.address ?? '',
    );

    if (supplierResult.isFailure)
      return Result.failure(supplierResult.error ?? 'Error al crear proveedor.');

    await this.supplierRepository.save(supplierResult.value!);
    return Result.success(supplierResult.value!.id);
  }
}