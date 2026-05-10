import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards, Req,
  HttpCode, HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/guards/roles.decorator';
import { CreateQuotationUseCase } from '../../application/use-cases/quotations/create-quotation.use-case';
import { GetAllQuotationsUseCase } from '../../application/use-cases/quotations/get-all-quotations.use-case';
import { GetMyQuotationsUseCase } from '../../application/use-cases/quotations/get-my-quotations.use-case';
import { ApproveQuotationUseCase } from '../../application/use-cases/quotations/approve-quotation.use-case';
import { RejectQuotationUseCase } from '../../application/use-cases/quotations/reject-quotation.use-case';
import { DeleteQuotationUseCase } from '../../application/use-cases/quotations/delete-quotation.use-case';
import { CreateQuotationRequest } from '../../domain/dtos/requests/create-quotation.request';
import { ApiResponse } from '../../domain/dtos/responses/api.response';

@Controller('api/quotations')
@UseGuards(JwtAuthGuard, RolesGuard)
export class QuotationsController {
  constructor(
    private readonly createQuotation: CreateQuotationUseCase,
    private readonly getAllQuotations: GetAllQuotationsUseCase,
    private readonly getMyQuotations: GetMyQuotationsUseCase,
    private readonly approveQuotation: ApproveQuotationUseCase,
    private readonly rejectQuotation: RejectQuotationUseCase,
    private readonly deleteQuotation: DeleteQuotationUseCase,
  ) {}

  @Get()
  @Roles('Admin')
  async getAll() {
    const result = await this.getAllQuotations.execute();
    return ApiResponse.ok(result.value ?? []);
  }

  @Get('my')
  @Roles('Admin', 'Empleado')
  async getMy(@Req() req: any) {
    const result = await this.getMyQuotations.execute(req.user.id);
    return ApiResponse.ok(result.value ?? []);
  }

  @Post()
  @Roles('Admin', 'Empleado')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() request: CreateQuotationRequest, @Req() req: any) {
    const result = await this.createQuotation.execute(request, req.user.id);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Error al crear cotización.');

    return ApiResponse.ok(result.value, 'Cotización creada exitosamente.');
  }

  @Patch(':id/approve')
  @Roles('Admin')
  async approve(@Param('id') id: string) {
    const result = await this.approveQuotation.execute(id);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Error al aprobar cotización.');

    return ApiResponse.ok(null, 'Cotización aprobada exitosamente.');
  }

  @Patch(':id/reject')
  @Roles('Admin')
  async reject(@Param('id') id: string) {
    const result = await this.rejectQuotation.execute(id);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Error al rechazar cotización.');

    return ApiResponse.ok(null, 'Cotización rechazada exitosamente.');
  }

  @Delete(':id')
  @Roles('Admin')
  async delete(@Param('id') id: string) {
    const result = await this.deleteQuotation.execute(id);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Error al eliminar cotización.');

    return ApiResponse.ok(null, 'Cotización eliminada exitosamente.');
  }
}