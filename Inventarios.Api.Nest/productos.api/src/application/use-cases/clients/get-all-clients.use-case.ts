import { Inject, Injectable } from '@nestjs/common';
import type { IClientRepository } from '../../../domain/interfaces/client.repository.interface';
import { Result } from '../../../domain/common/result';
import { ClientResponse } from '../../../domain/dtos/responses/client.response';

@Injectable()
export class GetAllClientsUseCase {
  constructor(
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(): Promise<Result<ClientResponse[]>> {
    const clients = await this.clientRepository.findAll();
    const response = clients.map(c => Object.assign(new ClientResponse(), c));
    return Result.success(response);
  }
}