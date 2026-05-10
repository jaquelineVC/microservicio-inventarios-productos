namespace Inventarios.api.Domain.Dtos.Responses;

public sealed record AuthResponse(
    string Token,
    string Name,
    string Email,
    string Role,
    DateTime ExpiresAt
);