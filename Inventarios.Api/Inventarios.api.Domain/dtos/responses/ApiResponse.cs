namespace Inventarios.api.Domain.Dtos.Responses;

/// <summary>
/// Envelope estándar para todas las respuestas de la API.
/// Garantiza consistencia en el contrato HTTP.
/// </summary>
public sealed record ApiResponse<T>(
    bool Success,
    string Message,
    T? Data,
    IEnumerable<string>? Errors = null
)
{
    public static ApiResponse<T> Ok(T data, string message = "OK") =>
        new(true, message, data);

    public static ApiResponse<T> Fail(string message, IEnumerable<string>? errors = null) =>
        new(false, message, default, errors);
}