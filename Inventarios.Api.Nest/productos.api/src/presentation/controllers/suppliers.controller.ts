import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/guards/roles.decorator';
import { GetAllSuppliersUseCase } from '../../application/use-cases/suppliers/get-all-suppliers.use-case';
import { CreateSupplierUseCase } from '../../application/use-cases/suppliers/create-supplier.use-case';
import { DeleteSupplierUseCase } from '../../application/use-cases/suppliers/delete-supplier.use-case';
import { CreateSupplierRequest } from '../../domain/dtos/requests/create-supplier.request';
import { ApiResponse } from '../../domain/dtos/responses/api.response';

@Controller('api/suppliers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SuppliersController {
  constructor(
    private readonly getAllSuppliers: GetAllSuppliersUseCase,
    private readonly createSupplier: CreateSupplierUseCase,
    private readonly deleteSupplier: DeleteSupplierUseCase,
  ) {}

  @Get()
  @Roles('Admin', 'Empleado')
  async getAll() {
    const result = await this.getAllSuppliers.execute();
    return ApiResponse.ok(result.value ?? []);
  }

  @Post()
  @Roles('Admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() request: CreateSupplierRequest) {
    const result = await this.createSupplier.execute(request);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Error al crear proveedor.');

    return ApiResponse.ok(result.value, 'Proveedor creado exitosamente.');
  }

  @Delete(':id')
  @Roles('Admin')
  async delete(@Param('id') id: string) {
    const result = await this.deleteSupplier.execute(id);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Error al eliminar proveedor.');

    return ApiResponse.ok(null, 'Proveedor eliminado exitosamente.');
  }
}