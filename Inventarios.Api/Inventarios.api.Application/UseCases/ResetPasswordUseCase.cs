using Inventarios.api.Application.Helpers;
using Inventarios.api.Application.Interfaces;
using Inventarios.api.Domain.Common;
using Inventarios.api.Domain.Dtos.Requests;
using Inventarios.api.Domain.Interfaces;

namespace Inventarios.api.Application.UseCases;

/// Caso de uso: Admin resetea la contraseña de un usuario.

public sealed class ResetPasswordUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public ResetPasswordUseCase(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result> ExecuteAsync(Guid userId, ResetPasswordRequest request, CancellationToken ct = default)
    {
        if (request.NewPassword != request.ConfirmNewPassword)
            return Result.Failure("Las contraseñas no coinciden.");

        if (!PasswordHelper.HasMinimumLength(request.NewPassword))
            return Result.Failure("La contraseña debe tener al menos 8 caracteres.");

        if (!PasswordHelper.HasMaximumLength(request.NewPassword))
            return Result.Failure("La contraseña no puede exceder 128 caracteres.");

        if (!PasswordHelper.HasValidComplexity(request.NewPassword))
            return Result.Failure("La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales.");

        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user is null)
            return Result.Failure("Usuario no encontrado.");

        var newHash = _passwordHasher.Hash(request.NewPassword);
        user.UpdatePassword(newHash);

        await _userRepository.UpdateAsync(user, ct);
        await _userRepository.SaveChangesAsync(ct);

        return Result.Success();
    }
}