using AspNetCoreRateLimit;
using Inventarios.api.Application.UseCases;
using Inventarios.api.Application.Interfaces;
using Inventarios.api.Infraestructure.Services;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;

namespace Inventarios.api.Test.Configuration;

public class ApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        builder.ConfigureServices(s =>
        {
            s.AddScoped<LoginUserUseCase>();
            s.AddScoped<RegisterUserUseCase>();
            s.AddScoped<GetAllUsersUseCase>();
            s.AddScoped<DeleteUserUseCase>();
            s.AddScoped<ResetPasswordUseCase>();
            s.AddSingleton<IJwtService, JwtService>();
            s.AddSingleton<IPasswordHasher, PasswordHasher>();

            // Deshabilitar Rate Limiting en pruebas
            s.Configure<IpRateLimitOptions>(options =>
            {
                options.EnableEndpointRateLimiting = false;
                options.GeneralRules = new List<RateLimitRule>
                {
                    new RateLimitRule
                    {
                        Endpoint = "*",
                        Period = "1m",
                        Limit = 10000
                    }
                };
            });
        });
    }
}