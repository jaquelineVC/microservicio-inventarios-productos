using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Inventarios.api.Test.Configuration;
using Xunit;
using Inventarios.api.Infraestructure.Services;
using Microsoft.Extensions.Configuration;

namespace Inventarios.api.Test.Tests;

public class SecurityTest : IClassFixture<ApiFactory>
{
    private readonly HttpClient _http;

    public SecurityTest(ApiFactory factory)
    {
        _http = factory.CreateClient();
    }

    [Fact]
    public async Task Request_Fail_TokenInvalido()
    {
        // Arrange — token inválido
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", "token.invalido.aqui");

        // Act
        var response = await _http.GetAsync("/api/User/me");

        // Assert
        Assert.True((int)response.StatusCode == 401);
    }

    [Fact]
    public async Task Request_Fail_TokenExpirado()
    {
        // Arrange — token con formato válido pero expirado
        var tokenExpirado = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
            "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlRlc3QiLCJleHAiOjE2MDAwMDAwMDB9." +
            "invalidsignature";

        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", tokenExpirado);

        // Act
        var response = await _http.GetAsync("/api/User/me");

        // Assert
        Assert.True((int)response.StatusCode == 401);
    }

    [Fact]
    public async Task Request_Fail_ContenidoMalicioso_Script()
    {
        // Arrange — XSS injection
        var contenidoMalicioso = new StringContent(
            "{\"email\":\"<script>alert('xss')</script>\",\"password\":\"test\"}",
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _http.PostAsync("/api/Auth/login", contenidoMalicioso);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task Request_Fail_ContenidoMalicioso_Javascript()
    {
        // Arrange — javascript injection
        var contenidoMalicioso = new StringContent(
            "{\"email\":\"javascript:alert(1)\",\"password\":\"test\"}",
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _http.PostAsync("/api/Auth/login", contenidoMalicioso);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task Request_Fail_ContenidoMalicioso_EventHandler()
    {
        // Arrange — event handler injection
        var contenidoMalicioso = new StringContent(
            "{\"email\":\"test@test.com\",\"password\":\"test\",\"name\":\"<img onload=alert(1)>\"}",
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _http.PostAsync("/api/Auth/login", contenidoMalicioso);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task SecurityHeaders_Present()
    {
        // Act
        var response = await _http.GetAsync("/api/Auth/login");

        // Assert — verificar headers de seguridad
        Assert.True(response.Headers.Contains("X-Frame-Options") ||
                    response.Content.Headers.Contains("X-Frame-Options") ||
                    response.Headers.Contains("x-frame-options"));
    }

    [Fact]
public void JwtService_ValidateToken_Fail_TokenInvalido()
{
    // Arrange — instanciar JwtService directamente con configuración real
    var configuration = new ConfigurationBuilder()
        .AddInMemoryCollection(new Dictionary<string, string?>
        {
            { "Jwt:SecretKey", "TU_CLAVE_SUPER_SECRETA_MINIMO_32_CARACTERES_AQUI_2024!" },
            { "Jwt:Issuer", "Inventarios.Api" },
            { "Jwt:Audience", "Inventarios.Client" },
            { "Jwt:ExpirationHours", "8" }
        })
        .Build();

    var jwtService = new JwtService(configuration);

    // Act — token completamente inválido fuerza el catch
    var result = jwtService.ValidateToken("token.invalido.que.fuerza.excepcion");

    // Assert
    Assert.False(result);
}
}