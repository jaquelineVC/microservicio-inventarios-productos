using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Inventarios.api.Infraestructure.Middleware;

/// <summary>
/// Cross Cutting — Manejo de excepciones global en .NET.
/// Captura TODAS las excepciones no manejadas.
/// NUNCA deja tronar el contenedor.
/// </summary>
public sealed class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;

    private static readonly string[] MaliciousPatterns =
    [
        "--", "DROP ", "DELETE FROM", "INSERT INTO",
        "<script", "javascript:", "UNION SELECT", "1=1"
    ];

    public GlobalExceptionMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        var statusCode = HttpStatusCode.InternalServerError;
        var message = "Error interno del servidor.";

        if (ContainsMaliciousPattern(ex.Message))
        {
            _logger.LogWarning(
                "🚨 ALERTA SEGURIDAD: Posible ataque detectado. " +
                "IP: {IP} | Path: {Path}",
                context.Connection.RemoteIpAddress,
                context.Request.Path);

            statusCode = HttpStatusCode.BadRequest;
            message = "Solicitud inválida.";
        }
        else
        {
            _logger.LogError(ex,
                "❌ Error no manejado en {Method} {Path}",
                context.Request.Method,
                context.Request.Path);
        }

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            success = false,
            message,
            statusCode = (int)statusCode,
            timestamp = DateTime.UtcNow,
            path = context.Request.Path.ToString()
        };

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response));
    }

    private static bool ContainsMaliciousPattern(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return false;
        return MaliciousPatterns.Any(p =>
            input.Contains(p, StringComparison.OrdinalIgnoreCase));
    }
}