using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Inventarios.api.Test.Configuration;
using Xunit;

namespace Inventarios.api.Test.Tests;

public class DomainValidationTest : IClassFixture<ApiFactory>
{
    private readonly HttpClient _http;


    public DomainValidationTest(ApiFactory factory)
    {
        _http = factory.CreateClient();
    }


    private async Task AuthenticateAsync()
    {
        var token = await AuthHelper.GetAdminTokenAsync(_http);
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

    // ── Email Value Object ────────────────────────────────────────────

    [Fact]
    public async Task Register_Fail_EmailVacio()
    {
        // Arrange
        await AuthenticateAsync();
        var request = new
        {
            name = "Test",
            email = "",
            password = "Test@1234",
            confirmPassword = "Test@1234",
            role = "Empleado"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task Register_Fail_EmailSinArroba()
    {
        // Arrange
        await AuthenticateAsync();
        var request = new
        {
            name = "Test",
            email = "emailsinarroba.com",
            password = "Test@1234",
            confirmPassword = "Test@1234",
            role = "Empleado"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task Register_Fail_EmailDominioInvalido()
    {
        // Arrange
        await AuthenticateAsync();
        var request = new
        {
            name = "Test",
            email = "test@dominioinvalido",
            password = "Test@1234",
            confirmPassword = "Test@1234",
            role = "Empleado"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task Register_Fail_EmailMuyLargo()
    {
        // Arrange
        await AuthenticateAsync();
        var emailLargo = new string('a', 250) + "@test.com"; // más de 254 chars
        var request = new
        {
            name = "Test",
            email = emailLargo,
            password = "Test@1234",
            confirmPassword = "Test@1234",
            role = "Empleado"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    // ── User Entity ───────────────────────────────────────────────────

    [Fact]
    public async Task Register_Fail_NombreVacio()
    {
        // Arrange
        await AuthenticateAsync();
        var request = new
        {
            name = "",
            email = $"test.{Guid.NewGuid()}@inventarios.com",
            password = "Test@1234",
            confirmPassword = "Test@1234",
            role = "Empleado"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task Register_Fail_NombreUnCaracter()
    {
        // Arrange
        await AuthenticateAsync();
        var request = new
        {
            name = "A",
            email = $"test.{Guid.NewGuid()}@inventarios.com",
            password = "Test@1234",
            confirmPassword = "Test@1234",
            role = "Empleado"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task Register_Fail_NombreMuyLargo()
    {
        // Arrange
        await AuthenticateAsync();
        var request = new
        {
            name = new string('A', 101), // más de 100 chars
            email = $"test.{Guid.NewGuid()}@inventarios.com",
            password = "Test@1234",
            confirmPassword = "Test@1234",
            role = "Empleado"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task Register_Fail_PasswordMuyCorta()
    {
        // Arrange
        await AuthenticateAsync();
        var request = new
        {
            name = "Test",
            email = $"test.{Guid.NewGuid()}@inventarios.com",
            password = "Ab@1",
            confirmPassword = "Ab@1",
            role = "Empleado"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task Register_Fail_PasswordMuyLarga()
    {
        // Arrange — contraseña de 129 caracteres que excede el límite de 128
        await AuthenticateAsync();
        var passwordLarga = "Aa@1" + new string('a', 125); // 4 + 125 = 129 chars
        var request = new
        {
            name = "Test",
            email = $"test.{Guid.NewGuid()}@inventarios.com",
            password = passwordLarga,
            confirmPassword = passwordLarga,
            role = "Empleado"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    // ── ResetPassword ─────────────────────────────────────────────────

    [Fact]
    public async Task ResetPassword_Fail_PasswordSinComplejidad()
    {
        // Arrange
        await AuthenticateAsync();
        var userId = await CrearUsuarioYObtenerIdAsync();

        var request = new
        {
            newPassword = "sincomplejidad",
            confirmNewPassword = "sincomplejidad"
        };

        // Act
        var response = await _http.PutAsJsonAsync(
            $"/api/admin/users/{userId}/reset-password", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task ResetPassword_Fail_NoToken()
    {
        // Act
        var response = await _http.PutAsJsonAsync(
            $"/api/admin/users/{Guid.NewGuid()}/reset-password",
            new { newPassword = "Test@1234", confirmNewPassword = "Test@1234" });

        // Assert
        Assert.True((int)response.StatusCode == 401);
    }

    // ── Helper privado ────────────────────────────────────────────────

    private async Task<string> CrearUsuarioYObtenerIdAsync()
    {
        var email = $"temp.{Guid.NewGuid()}@inventarios.com";
        var response = await _http.PostAsJsonAsync("/api/Register", new
        {
            name = "Usuario Temporal",
            email,
            password = "Temporal@1234",
            confirmPassword = "Temporal@1234",
            role = "Empleado"
        });

        var body = await response.Content.ReadAsStringAsync();
        var elementos = JsonSerializer.Deserialize<Dictionary<string, object>>(body);
        return elementos!["data"].ToString()!;
    }

    [Fact]
    public async Task Login_Fail_CuentaDesactivada()
    {
        // Arrange — crear usuario, obtener su ID y desactivarlo
        await AuthenticateAsync();
        var email = $"desactivar.{Guid.NewGuid()}@inventarios.com";

        var registerResponse = await _http.PostAsJsonAsync("/api/Register", new
        {
            name = "Usuario Desactivar",
            email,
            password = "Desactivar@1234",
            confirmPassword = "Desactivar@1234",
            role = "Empleado"
        });

        var registerBody = await registerResponse.Content.ReadAsStringAsync();
        var elementos = JsonSerializer.Deserialize<Dictionary<string, object>>(registerBody);
        var userId = elementos!["data"].ToString();

        // Eliminar usuario simula desactivación — o podemos probar login con usuario eliminado
        await _http.DeleteAsync($"/api/admin/users/{userId}");

        // Act — intentar login con usuario eliminado
        var response = await _http.PostAsJsonAsync("/api/Auth/login", new
        {
            email,
            password = "Desactivar@1234"
        });

        // Assert
        Assert.True((int)response.StatusCode == 401);
    }

    [Fact]
    public async Task ResetPassword_Fail_PasswordMuyCorta()
    {
        // Arrange
        await AuthenticateAsync();
        var userId = await CrearUsuarioYObtenerIdAsync();

        var request = new
        {
            newPassword = "Ab@1",
            confirmNewPassword = "Ab@1"
        };

        // Act
        var response = await _http.PutAsJsonAsync(
            $"/api/admin/users/{userId}/reset-password", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task ResetPassword_Fail_PasswordMuyLarga()
    {
        // Arrange
        await AuthenticateAsync();
        var userId = await CrearUsuarioYObtenerIdAsync();

        var passwordLarga = "Aa@1" + new string('a', 125);
        var request = new
        {
            newPassword = passwordLarga,
            confirmNewPassword = passwordLarga
        };

        // Act
        var response = await _http.PutAsJsonAsync(
            $"/api/admin/users/{userId}/reset-password", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

}