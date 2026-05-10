using Inventarios.api.Domain.Common;
using Inventarios.api.Domain.Interfaces;

namespace Inventarios.api.Application.UseCases;

/// <summary>
/// Caso de uso: Eliminar un usuario por ID.
/// Scoped — una instancia por request.
/// </summary>
public sealed class DeleteUserUseCase
{
    private readonly IUserRepository _userRepository;

    public DeleteUserUseCase(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<Result> ExecuteAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct);

        if (user is null)
            return Result.Failure("Usuario no encontrado.");

        await _userRepository.DeleteAsync(user, ct);
        await _userRepository.SaveChangesAsync(ct);

        return Result.Success();
    }
}