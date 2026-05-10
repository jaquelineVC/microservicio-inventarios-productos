using Inventarios.api.Application.Helpers;
using Inventarios.api.Application.Interfaces;
using Inventarios.api.Domain.Common;
using Inventarios.api.Domain.Dtos.Requests;
using Inventarios.api.Domain.Entities;
using Inventarios.api.Domain.Enums;
using Inventarios.api.Domain.Interfaces;

namespace Inventarios.api.Application.UseCases;

public sealed class RegisterUserUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;

    public RegisterUserUseCase(IUserRepository userRepository, IPasswordHasher passwordHasher)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<Guid>> ExecuteAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (request.Password != request.ConfirmPassword)
            return Result<Guid>.Failure("Las contraseñas no coinciden.");

        if (!PasswordHelper.HasMinimumLength(request.Password))
            return Result<Guid>.Failure("La contraseña debe tener al menos 8 caracteres.");

        if (!PasswordHelper.HasMaximumLength(request.Password))
            return Result<Guid>.Failure("La contraseña no puede exceder 128 caracteres.");

        if (!PasswordHelper.HasValidComplexity(request.Password))
            return Result<Guid>.Failure("La contraseña debe contener mayúsculas, minúsculas, números y caracteres especiales.");

        // Validar que el rol sea válido
        if (!Enum.TryParse<UserRole>(request.Role, ignoreCase: true, out var role))
            return Result<Guid>.Failure("Rol inválido. Los roles válidos son: Admin, Empleado, Cliente.");

        var exists = await _userRepository.ExistsByEmailAsync(request.Email, ct);
        if (exists)
            return Result<Guid>.Failure("Ya existe un usuario con ese email.");

        var passwordHash = _passwordHasher.Hash(request.Password);

        var userResult = User.Create(request.Name, request.Email, passwordHash, role);
        if (userResult.IsFailure)
            return Result<Guid>.Failure(userResult.Error!);

        await _userRepository.AddAsync(userResult.Value!, ct);
        await _userRepository.SaveChangesAsync(ct);

        return Result<Guid>.Success(userResult.Value!.Id);
    }
}