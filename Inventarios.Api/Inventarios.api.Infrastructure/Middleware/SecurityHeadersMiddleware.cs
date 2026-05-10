using Microsoft.AspNetCore.Http;

namespace Inventarios.api.Infraestructure.Middleware;

public sealed class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;

    public SecurityHeadersMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context)
    {
        var headers = context.Response.Headers;

        headers["X-XSS-Protection"] = "1; mode=block";
        headers["X-Content-Type-Options"] = "nosniff";
        headers["X-Frame-Options"] = "DENY";
        headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'";
        headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
        headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
        headers.Remove("Server");
        headers.Remove("X-Powered-By");

        await _next(context);
    }
}