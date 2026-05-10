using Inventarios.api.Application.UseCases;
using Microsoft.Extensions.DependencyInjection;

namespace Inventarios.api.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<RegisterUserUseCase>();
        services.AddScoped<LoginUserUseCase>();
        services.AddScoped<GetAllUsersUseCase>();
        services.AddScoped<DeleteUserUseCase>();
        services.AddScoped<ResetPasswordUseCase>();
        return services;
    }
}