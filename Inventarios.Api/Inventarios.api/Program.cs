using System.Text;
using AspNetCoreRateLimit;
using Inventarios.api.Application;
using Inventarios.api.Infraestructure;
using Inventarios.api.Infraestructure.Middleware;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Inventarios.api.BackgroundServices;

var builder = WebApplication.CreateBuilder(args);

// ── Capas Clean Architecture ──────────────────────────────────────────────────
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// ── Rate Limiting (protección DDoS y Fuerza Bruta) ───────────────────────────
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(builder.Configuration.GetSection("IpRateLimiting"));
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();

// ── JWT Authentication ────────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:SecretKey"]
    ?? throw new InvalidOperationException("JWT SecretKey no configurada.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };

    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            context.Response.StatusCode = 401;
            return Task.CompletedTask;
        },
        OnForbidden = context =>
        {
            context.Response.StatusCode = 403;
            return Task.CompletedTask;
        }
    };
});

builder.Services.AddAuthorization();

// ── CORS ──
builder.Services.AddCors(options =>
{
    options.AddPolicy("DefaultPolicy", policy =>
    {
        policy.WithOrigins(
                "http://localhost:4200",   // Angular dev
                "http://localhost:5210")   // Swagger dev
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ── Controllers ────
builder.Services.AddControllers(options =>
{
    options.ReturnHttpNotAcceptable = true;
});

// ── Swagger con soporte JWT ───
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Inventarios API",
        Version = "v1",
        Description = "API de gestión de inventarios con Clean Architecture y .NET 8"
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Ingresa el token JWT. Ejemplo: Bearer {tu_token}"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ── Pipeline de Middleware (orden importa) ────────────────────────────────────

// 1. Swagger PRIMERO — antes de cualquier middleware que pueda bloquearlo
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Inventarios API v1");
        c.RoutePrefix = string.Empty;
    });
}

// Cross Cutting — Manejo de excepciones global
app.UseMiddleware<GlobalExceptionMiddleware>();

// 2. Rate limiting
app.UseIpRateLimiting();

// 3. Headers de seguridad
app.UseMiddleware<SecurityHeadersMiddleware>();

// 4. Sanitización
app.UseMiddleware<SanitizationMiddleware>();

// 5. HTTPS
app.UseHttpsRedirection();

// 6. CORS
app.UseCors("DefaultPolicy");

// 7. Auth
app.UseAuthentication();
app.UseAuthorization();

// 8. Controllers
app.MapControllers();

await app.RunAsync();

// ── Segundo Plano — Limpiador de intentos fallidos ────────────────
builder.Services.AddHostedService<LoginCleanerService>();

public partial class Program { }

