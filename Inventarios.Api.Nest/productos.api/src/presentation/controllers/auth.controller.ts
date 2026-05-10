import {
  Controller, Post, Body, HttpCode, HttpStatus
} from '@nestjs/common';
import { LoginUseCase } from '../../application/use-cases/auth/login.use-case';
import { LoginRequest } from '../../domain/dtos/requests/login.request';
import { ApiResponse } from '../../domain/dtos/responses/api.response';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() request: LoginRequest) {
    const result = await this.loginUseCase.execute(request);

    if (result.isFailure)
      return ApiResponse.fail(result.error ?? 'Error al autenticar.');

    return ApiResponse.ok(result.value, 'Autenticación exitosa.');
  }
}