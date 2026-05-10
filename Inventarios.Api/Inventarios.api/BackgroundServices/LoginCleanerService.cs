using Inventarios.api.Infraestructure.Context;
using Microsoft.EntityFrameworkCore;

namespace Inventarios.api.BackgroundServices;

/// <summary>
/// Servicio de segundo plano que se ejecuta cada hora.
/// Limpia intentos de login fallidos y detecta patrones maliciosos.
/// Principio SRP: solo responsable de la limpieza periódica.
/// </summary>
public sealed class LoginCleanerService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<LoginCleanerService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromHours(1);

    // Patrones de SQL Injection a detectar
    private static readonly string[] MaliciousPatterns =
    [
        "--", ";--", "/*", "*/", "xp_",
        "DROP ", "DELETE ", "INSERT ", "UPDATE ",
        "UNION ", "SELECT ", "1=1", "OR 1",
        "<script", "javascript:", "EXEC "
    ];

    public LoginCleanerService(
        IServiceScopeFactory scopeFactory,
        ILogger<LoginCleanerService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "LoginCleanerService iniciado. Intervalo: {Interval}",
            _interval);

        // Ejecuta inmediatamente al arrancar
        await RunCleanupAsync(stoppingToken);

        // Luego cada hora
        using var timer = new PeriodicTimer(_interval);
        while (await timer.WaitForNextTickAsync(stoppingToken))
        {
            await RunCleanupAsync(stoppingToken);
        }
    }

    private async Task RunCleanupAsync(CancellationToken ct)
    {
        _logger.LogInformation(
            "[{Time}] Iniciando limpieza de intentos fallidos...",
            DateTime.UtcNow);

        try
        {
            using var scope = _scopeFactory.CreateScope();
            var context = scope.ServiceProvider
                .GetRequiredService<AppDbContext>();

            // Buscar usuarios con intentos fallidos
            var suspiciousUsers = await context.Users
                .Where(u => u.FailedLoginAttempts >= 3)
                .ToListAsync(ct);

            var cleaned = 0;
            var maliciousDetected = 0;

            foreach (var user in suspiciousUsers)
            {
                // Detectar patrones maliciosos en el email
                if (ContainsMaliciousPattern(user.Email))
                {
                    _logger.LogWarning(
                        "ALERTA SEGURIDAD: Patrón malicioso detectado " +
                        "en email: {Email}. Registro descartado sin procesar.",
                        SanitizeForLog(user.Email));

                    maliciousDetected++;
                    continue; // No procesar — descartar
                }

                // Si el último intento fue hace más de 24 horas, resetear
                var lastAttempt = user.LockedUntil ?? user.CreatedAt;
                if (lastAttempt < DateTime.UtcNow.AddHours(-24))
                {
                    _logger.LogInformation(
                        "Reseteando intentos fallidos para usuario: {Email}",
                        user.Email);

                    user.RegisterSuccessfulLogin();
                    cleaned++;
                }
            }

            if (cleaned > 0 || maliciousDetected > 0)
                await context.SaveChangesAsync(ct);

            _logger.LogInformation(
                "✅ Limpieza completada. " +
                "Reseteados: {Cleaned} | Maliciosos detectados: {Malicious}",
                cleaned, maliciousDetected);
        }
        catch (OperationCanceledException)
        {
            // El servicio fue cancelado — es normal al apagar
            _logger.LogInformation("LoginCleanerService detenido correctamente.");
        }
        catch (Exception ex)
        {
            // NUNCA dejar tronar el contenedor — capturamos
            _logger.LogError(ex,
                "Error en LoginCleanerService. " +
                "El servicio continuará en el próximo ciclo.");
        }
    }

    /// <summary>
    /// Detecta patrones de SQL Injection y ataques en strings.
    /// Si detecta algo malicioso, loguea y descarta sin procesar.
    /// </summary>
    private static bool ContainsMaliciousPattern(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return false;

        var upperInput = input.ToUpperInvariant();
        return MaliciousPatterns.Any(pattern =>
            upperInput.Contains(pattern.ToUpperInvariant(),
                StringComparison.OrdinalIgnoreCase));
    }

    /// <summary>
    /// Sanitiza strings para logs — evita Log Injection.
    /// </summary>
    private static string SanitizeForLog(string input) =>
        input.Replace("\n", "\\n")
             .Replace("\r", "\\r")
             .Replace("\t", "\\t")[..Math.Min(input.Length, 50)];
}