import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards, Req,
  HttpCode, HttpStatus, ForbiddenException
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/guards/roles.decorator';
import { GetAllProductsUseCase } from '../../application/use-cases/products/get-all-products.use-case';
import { GetProductByIdUseCase } from '../../application/use-cases/products/get-product-by-id.use-case';
import { SearchProductsUseCase } from '../../application/use-cases/products/search-products.use-case';
import { CreateProductUseCase } from '../../application/use-cases/products/create-product.use-case';
import { UpdateProductUseCase } from '../../application/use-cases/products/update-product.use-case';
import { DeleteProductUseCase } from '../../application/use-cases/products/delete-product.use-case';
import { CreateProductRequest } from '../../domain/dtos/requests/create-product.request';
import { UpdateProductRequest } from '../../domain/dtos/requests/update-product.request';
import { ApiResponse } from '../../domain/dtos/responses/api.response';

@Controller('api/products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(
    private readonly getAllProducts: GetAllProductsUseCase,
    private readonly getProductById: GetProductByIdUseCase,
    private readonly searchProducts: SearchProductsUseCase,
    private readonly createProduct: CreateProductUseCase,
    private readonly updateProduct: UpdateProductUseCase,
    private readonly deleteProduct: DeleteProductUseCase,
  ) {}

  @Get()
  @Roles('Admin', 'Empleado')
  async getAll() {
    const result = await this.getAllProducts.execute();
    return ApiResponse.ok(result.value ?? []);
  }

  @Get('search')
  @Roles('Admin', 'Empleado')
  async search(
    @Query('q') query: string,
    @Query('categoryId') categoryId?: string,
  ) {
    const result = await this.searchProducts.execute(query, categoryId);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Error en búsqueda.');

    return ApiResponse.ok(result.value ?? []);
  }

  @Get(':id')
  @Roles('Admin', 'Empleado')
  async getById(@Param('id') id: string) {
    const result = await this.getProductById.execute(id);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Producto no encontrado.');

    return ApiResponse.ok(result.value);
  }

  @Post()
  @Roles('Admin', 'Empleado')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() request: CreateProductRequest) {
    const result = await this.createProduct.execute(request);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Error al crear producto.');

    return ApiResponse.ok(result.value, 'Producto creado exitosamente.');
  }

  @Put(':id')
  @Roles('Admin', 'Empleado')
  async update(
    @Param('id') id: string,
    @Body() request: UpdateProductRequest,
    @Req() req: any,
  ) {
    // Empleado necesita autorización del Admin para editar
    if (req.user.role === 'Empleado')
      throw new ForbiddenException(
        'Los empleados necesitan autorización del administrador para editar productos.',
      );

    const result = await this.updateProduct.execute(id, request);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Error al actualizar producto.');

    return ApiResponse.ok(null, 'Producto actualizado exitosamente.');
  }

  @Delete(':id')
  @Roles('Admin')
  async delete(@Param('id') id: string) {
    const result = await this.deleteProduct.execute(id);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Error al eliminar producto.');

    return ApiResponse.ok(null, 'Producto eliminado exitosamente.');
  }
}