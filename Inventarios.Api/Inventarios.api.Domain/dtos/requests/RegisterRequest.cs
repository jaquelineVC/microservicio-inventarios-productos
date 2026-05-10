namespace Inventarios.api.Domain.Dtos.Requests;

public sealed record RegisterRequest(
    string Name,
    string Email,
    string Password,
    string ConfirmPassword,
    string Role = "Empleado"
);