using Inventarios.api.Application.Interfaces;

namespace Inventarios.api.Infraestructure.Services;

/// <summary>
/// BCrypt con work factor 12 — costo computacional alto intencionalmente
/// para dificultar ataques de diccionario y fuerza bruta.
/// Singleton — sin estado, reutilizable.
/// </summary>
public sealed class PasswordHasher : IPasswordHasher
{
    private const int WorkFactor = 12;

    public string Hash(string plainPassword) =>
        BCrypt.Net.BCrypt.HashPassword(plainPassword, WorkFactor);

    public bool Verify(string plainPassword, string hashedPassword) =>
        BCrypt.Net.BCrypt.Verify(plainPassword, hashedPassword);
}