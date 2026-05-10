using Inventarios.api.Domain.Common;
namespace Inventarios.api.Domain.ValueObjects;

/// Value Object inmutable que encapsula y valida el formato de un email.

public sealed class Email
{
    public string Value { get; }

    private Email(string value) => Value = value;

    public static Result<Email> Create(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return Result<Email>.Failure("El email no puede estar vacío.");

        email = email.Trim().ToLowerInvariant();

        if (email.Length > 254)
            return Result<Email>.Failure("El email excede la longitud máxima.");

        // Validación estricta sin regex peligrosa (evita ReDoS)
        var atIndex = email.IndexOf('@');
        if (atIndex <= 0 || atIndex == email.Length - 1)
            return Result<Email>.Failure("Formato de email inválido.");

        var domain = email[(atIndex + 1)..];
        if (!domain.Contains('.') || domain.StartsWith('.') || domain.EndsWith('.'))
            return Result<Email>.Failure("Dominio de email inválido.");

        return Result<Email>.Success(new Email(email));
    }

    public override string ToString() => Value;
    public override bool Equals(object? obj) => obj is Email other && Value == other.Value;
    public override int GetHashCode() => Value.GetHashCode();
}