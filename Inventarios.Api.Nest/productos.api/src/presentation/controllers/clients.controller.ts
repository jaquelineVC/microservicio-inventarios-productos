import {
  Controller, Get, Post,
  Body, UseGuards, HttpCode, HttpStatus
} from '@nestjs/common';
import { JwtAuthGuard } from '../../infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from '../../infrastructure/guards/roles.guard';
import { Roles } from '../../infrastructure/guards/roles.decorator';
import { GetAllClientsUseCase } from '../../application/use-cases/clients/get-all-clients.use-case';
import { CreateClientUseCase } from '../../application/use-cases/clients/create-client.use-case';
import { CreateClientRequest } from '../../domain/dtos/requests/create-client.request';
import { ApiResponse } from '../../domain/dtos/responses/api.response';

@Controller('api/clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(
    private readonly getAllClients: GetAllClientsUseCase,
    private readonly createClient: CreateClientUseCase,
  ) {}

  @Get()
  @Roles('Admin', 'Empleado')
  async getAll() {
    const result = await this.getAllClients.execute();
    return ApiResponse.ok(result.value ?? []);
  }

  @Post()
  @Roles('Admin', 'Empleado')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() request: CreateClientRequest) {
    const result = await this.createClient.execute(request);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Error al crear cliente.');

    return ApiResponse.ok(result.value, 'Cliente creado exitosamente.');
  }
}