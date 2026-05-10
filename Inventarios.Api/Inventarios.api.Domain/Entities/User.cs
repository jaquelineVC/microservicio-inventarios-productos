using Inventarios.api.Domain.Common;
using Inventarios.api.Domain.Enums;
using EmailVO = Inventarios.api.Domain.ValueObjects.Email; // alias para evitar conflicto

namespace Inventarios.api.Domain.Entities;

public sealed class User
{
    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Email { get; private set; } = string.Empty;  
    public string PasswordHash { get; private set; } = string.Empty;
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public int FailedLoginAttempts { get; private set; }
    public DateTime? LockedUntil { get; private set; }

    private User() { }

    public static Result<User> Create(string name, string email, string passwordHash, UserRole role = UserRole.Admin)
    {
        
        var emailResult = EmailVO.Create(email);
        if (emailResult.IsFailure)
            return Result<User>.Failure(emailResult.Error!);

        if (string.IsNullOrWhiteSpace(name) || name.Length < 2)
            return Result<User>.Failure("El nombre debe tener al menos 2 caracteres.");

        if (name.Length > 100)
            return Result<User>.Failure("El nombre no puede exceder 100 caracteres.");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Name = name.Trim(),
            Email = emailResult.Value!.Value, // .Value del Result, .Value del EmailVO
            PasswordHash = passwordHash,
            Role = role,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            FailedLoginAttempts = 0
        };

        return Result<User>.Success(user);
    }

    public bool IsLocked() =>
        LockedUntil.HasValue && LockedUntil.Value > DateTime.UtcNow;

    public void RegisterFailedLogin()
    {
        FailedLoginAttempts++;
        if (FailedLoginAttempts >= 5)
            LockedUntil = DateTime.UtcNow.AddMinutes(15);
    }

    public void RegisterSuccessfulLogin()
    {
        FailedLoginAttempts = 0;
        LockedUntil = null;
        LastLoginAt = DateTime.UtcNow;
    }

    public void Deactivate() => IsActive = false;
    public void Activate() => IsActive = true;

    public void UpdatePassword(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
        // Resetea intentos fallidos al cambiar contraseña
        FailedLoginAttempts = 0;
        LockedUntil = null;
    }
}