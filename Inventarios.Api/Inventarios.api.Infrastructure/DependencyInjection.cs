using Inventarios.api.Application.Interfaces;
using Inventarios.api.Domain.Interfaces;
using Inventarios.api.Infraestructure.Context;
using Inventarios.api.Infraestructure.Repositories;
using Inventarios.api.Infraestructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Inventarios.api.Infraestructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // DbContext — Scoped por defecto en EF Core
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Cadena de conexión no encontrada.");

        services.AddDbContext<AppDbContext>(options =>
            options.UseMySql(
                connectionString,
                ServerVersion.AutoDetect(connectionString),
                mySqlOptions => mySqlOptions.EnableRetryOnFailure(
                    maxRetryCount: 3,
                    maxRetryDelay: TimeSpan.FromSeconds(5),
                    errorNumbersToAdd: null)
            ));

        // Repositorios — Scoped (vida igual al request)
        services.AddScoped<IUserRepository, UserRepository>();

        // Servicios — Singleton (sin estado, seguros para reutilizar)
        services.AddSingleton<IJwtService, JwtService>();
        services.AddSingleton<IPasswordHasher, PasswordHasher>();

        return services;
    }
}