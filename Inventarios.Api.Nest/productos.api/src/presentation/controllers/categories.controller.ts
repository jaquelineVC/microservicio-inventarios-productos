import {
  Controller, Get, Post, Delete,
  Body, Param, UseGuards, HttpCode, HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/guards/roles.decorator';
import { GetAllCategoriesUseCase } from '../../application/use-cases/categories/get-all-categories.use-case';
import { CreateCategoryUseCase } from '../../application/use-cases/categories/create-category.use-case';
import { DeleteCategoryUseCase } from '../../application/use-cases/categories/delete-category.use-case';
import { CreateCategoryRequest } from '../../domain/dtos/requests/create-category.request';
import { ApiResponse } from '../../domain/dtos/responses/api.response';

@Controller('api/categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(
    private readonly getAllCategories: GetAllCategoriesUseCase,
    private readonly createCategory: CreateCategoryUseCase,
    private readonly deleteCategory: DeleteCategoryUseCase,
  ) {}

  @Get()
  @Roles('Admin', 'Empleado')
  async getAll() {
    const result = await this.getAllCategories.execute();
    return ApiResponse.ok(result.value ?? []);
  }

  @Post()
  @Roles('Admin')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() request: CreateCategoryRequest) {
    const result = await this.createCategory.execute(request);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Error al crear categoría.');

    return ApiResponse.ok(result.value, 'Categoría creada exitosamente.');
  }

  @Delete(':id')
  @Roles('Admin')
  async delete(@Param('id') id: string) {
    const result = await this.deleteCategory.execute(id);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Error al eliminar categoría.');

    return ApiResponse.ok(null, 'Categoría eliminada exitosamente.');
  }
}