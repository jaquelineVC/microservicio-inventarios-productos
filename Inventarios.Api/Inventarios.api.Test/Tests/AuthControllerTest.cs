using System.Net.Http.Json;
using System.Net.Http.Headers;
using System.Text.Json;
using Inventarios.api.Test.Configuration;
using Xunit;

namespace Inventarios.api.Test.Tests;

public class AuthControllerTest : IClassFixture<ApiFactory>
{
    private readonly HttpClient _http;

    public AuthControllerTest(ApiFactory factory)
    {
        _http = factory.CreateClient();
    }

    [Fact]
    public async Task Login_Ok()
    {
        // Arrange
        var request = new
        {
            email = "diana2@inventarios.com",
            password = "Admin@1234"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Auth/login", request);
        var body = await response.Content.ReadAsStringAsync();
        var elementos = JsonSerializer.Deserialize<Dictionary<string, object>>(body);

        // Assert
        Assert.True(response.IsSuccessStatusCode && (int)response.StatusCode == 200);
        Assert.NotNull(elementos);
        Assert.True(elementos?.ContainsKey("data"));
    }

    [Fact]
    public async Task Login_Fail_WrongPassword()
    {
        // Arrange
        var request = new
        {
            email = "diana2@inventarios.com",
            password = "Incorrecta@123"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Auth/login", request);

        // Assert
        Assert.True((int)response.StatusCode == 401);
    }

    [Fact]
    public async Task Login_Fail_EmailNotFound()
    {
        // Arrange
        var request = new
        {
            email = "noexiste@inventarios.com",
            password = "Admin@1234"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Auth/login", request);

        // Assert
        Assert.True((int)response.StatusCode == 401);
    }

    [Fact]
    public async Task Login_Fail_AccountLocked()
    {
        // Arrange — crear usuario exclusivo para esta prueba
        // Primero obtener token de admin para registrar
        var adminToken = await AuthHelper.GetAdminTokenAsync(_http);
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", adminToken);

        var emailBloqueo = $"bloqueo.{Guid.NewGuid()}@inventarios.com";
        await _http.PostAsJsonAsync("/api/Register", new
        {
            name = "Usuario Bloqueo",
            email = emailBloqueo,
            password = "Bloqueo@1234",
            confirmPassword = "Bloqueo@1234",
            role = "Empleado"
        });

        // Limpiar header de admin
        _http.DefaultRequestHeaders.Authorization = null;

        // 5 intentos fallidos para bloquear la cuenta
        for (int i = 0; i < 5; i++)
        {
            await _http.PostAsJsonAsync("/api/Auth/login", new
            {
                email = emailBloqueo,
                password = "Incorrecta@123"
            });
        }

        // Act — intento con contraseña correcta pero cuenta bloqueada
        var response = await _http.PostAsJsonAsync("/api/Auth/login", new
        {
            email = emailBloqueo,
            password = "Bloqueo@1234"
        });
        var body = await response.Content.ReadAsStringAsync();

        // Assert
        Assert.True((int)response.StatusCode == 401);
        Assert.Contains("bloqueada", body);
    }
}