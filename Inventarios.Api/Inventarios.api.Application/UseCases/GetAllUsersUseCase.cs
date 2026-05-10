using Inventarios.api.Domain.Common;
using Inventarios.api.Domain.Dtos.Responses;
using Inventarios.api.Domain.Interfaces;

namespace Inventarios.api.Application.UseCases;

/// Caso de uso: Obtener todos los usuarios.

public sealed class GetAllUsersUseCase
{
    private readonly IUserRepository _userRepository;

    public GetAllUsersUseCase(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result<IEnumerable<UserResponse>>> ExecuteAsync(CancellationToken ct = default)
    {
        var users = await _userRepository.GetAllAsync(ct);

        var response = users.Select(u => new UserResponse(
            u.Id,
            u.Name,
            u.Email,
            u.Role.ToString(),
            u.IsActive,
            u.CreatedAt,
            u.LastLoginAt
        ));

        return Result<IEnumerable<UserResponse>>.Success(response);
    }
}