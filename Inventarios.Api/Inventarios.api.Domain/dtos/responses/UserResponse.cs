namespace Inventarios.api.Domain.Dtos.Responses;

public sealed record UserResponse(
    Guid Id,
    string Name,
    string Email,
    string Role,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? LastLoginAt
);