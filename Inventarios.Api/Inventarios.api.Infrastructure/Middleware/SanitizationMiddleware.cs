using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Inventarios.api.Infraestructure.Helpers;

namespace Inventarios.api.Infraestructure.Middleware;

public sealed class SanitizationMiddleware
{
    private readonly RequestDelegate _next;

    public SanitizationMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        if (context.Request.ContentLength > 0 &&
    context.Request.ContentType is not null &&
    context.Request.ContentType.Contains("application/json"))
        {
            var bodyBytes = await ReadStreamAsync(context.Request.Body);
            context.Request.Body = new MemoryStream(bodyBytes);

            var body = Encoding.UTF8.GetString(bodyBytes);

            if (SanitizationHelper.ContainsMaliciousContent(body))
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                context.Response.ContentType = "application/json";

                var json = JsonSerializer.Serialize(new
                {
                    success = false,
                    message = "El contenido de la solicitud contiene caracteres no permitidos."
                });

                await context.Response.WriteAsync(json, Encoding.UTF8);
                return;
            }

            context.Request.Body.Position = 0;
        }

        await _next(context);
    }

    private static async Task<byte[]> ReadStreamAsync(Stream stream)
    {
        using var ms = new MemoryStream();
        await stream.CopyToAsync(ms);
        return ms.ToArray();
    }
}
