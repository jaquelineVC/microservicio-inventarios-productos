using Inventarios.api.Application.Interfaces;
using Inventarios.api.Domain.Common;
using Inventarios.api.Domain.Dtos.Requests;
using Inventarios.api.Domain.Dtos.Responses;
using Inventarios.api.Domain.Interfaces;

namespace Inventarios.api.Application.UseCases;

public sealed class LoginUserUseCase
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtService _jwtService;

    public LoginUserUseCase(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtService jwtService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtService = jwtService;
    }

    public async Task<Result<AuthResponse>> ExecuteAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, ct);

        if (user is null)
            return Result<AuthResponse>.Failure("Credenciales inválidas.");

        if (!user.IsActive)
            return Result<AuthResponse>.Failure("La cuenta está desactivada.");

        if (user.IsLocked())
            return Result<AuthResponse>.Failure("Cuenta bloqueada temporalmente por múltiples intentos fallidos. Intenta en 15 minutos.");

        var passwordValid = _passwordHasher.Verify(request.Password, user.PasswordHash);
        if (!passwordValid)
        {
            user.RegisterFailedLogin();
            await _userRepository.UpdateAsync(user, ct);
            await _userRepository.SaveChangesAsync(ct);
            return Result<AuthResponse>.Failure("Credenciales inválidas.");
        }

        user.RegisterSuccessfulLogin();
        await _userRepository.UpdateAsync(user, ct);
        await _userRepository.SaveChangesAsync(ct);

        var token = _jwtService.GenerateToken(user);
        var expiresAt = DateTime.UtcNow.AddHours(8);

        var response = new AuthResponse(
            Token: token,
            Name: user.Name,
            Email: user.Email,
            Role: user.Role.ToString(),
            ExpiresAt: expiresAt
        );

        return Result<AuthResponse>.Success(response);
    }
}