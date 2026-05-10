namespace Inventarios.api.Domain.Dtos.Requests;

public sealed record LoginRequest(
    string Email,
    string Password
);