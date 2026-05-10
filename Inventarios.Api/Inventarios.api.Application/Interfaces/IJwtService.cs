using Inventarios.api.Domain.Entities;

namespace Inventarios.api.Application.Interfaces;

/// Puerto de salida hacia el servicio JWT.
public interface IJwtService
{
    string GenerateToken(User user);
    bool ValidateToken(string token);
}