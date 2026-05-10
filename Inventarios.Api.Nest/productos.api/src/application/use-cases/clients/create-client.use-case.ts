import { Inject, Injectable } from '@nestjs/common';
import type { IClientRepository } from '../../../domain/interfaces/client.repository.interface';
import { Result } from '../../../domain/common/result';
import { CreateClientRequest } from '../../../domain/dtos/requests/create-client.request';
import { ClientDomain } from '../../../domain/entities/client.entity';

@Injectable()
export class CreateClientUseCase {
  constructor(
    @Inject('IClientRepository')
    private readonly clientRepository: IClientRepository,
  ) {}

  async execute(request: CreateClientRequest): Promise<Result<string>> {
    const exists = await this.clientRepository.existsByEmail(request.email);
    if (exists)
      return Result.failure('Ya existe un cliente con ese email.');

    const clientResult = ClientDomain.create(
      request.name,
      request.email,
      request.phone ?? '',
      request.address ?? '',
    );

    if (clientResult.isFailure)
        return Result.failure(clientResult.error ?? 'Error al crear cliente.');

    const client = clientResult.value;
        if (!client)
            return Result.failure('Error al crear cliente.');

    await this.clientRepository.save(client);
            return Result.success(client.id);
  }
}