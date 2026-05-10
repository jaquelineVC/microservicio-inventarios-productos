using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Inventarios.api.Test.Configuration;
using Xunit;

namespace Inventarios.api.Test.Tests;

public class AdminControllerTest : IClassFixture<ApiFactory>
{
    private readonly HttpClient _http;
    private readonly ApiFactory _factory;

    public AdminControllerTest(ApiFactory factory)
    {
        _factory = factory;
        _http = factory.CreateClient();
    }

    private HttpClient CreateEmpleadoClient() => _factory.CreateClient();

    private async Task AuthenticateAsync()
    {
        var token = await AuthHelper.GetAdminTokenAsync(_http);
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
    }

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
    public async Task GetAllUsers_Ok()
    {
        // Arrange
        await AuthenticateAsync();

        // Act
        var response = await _http.GetAsync("/api/admin/users");
        var body = await response.Content.ReadAsStringAsync();
        var elementos = JsonSerializer.Deserialize<Dictionary<string, object>>(body);

        // Assert
        Assert.True(response.IsSuccessStatusCode && (int)response.StatusCode == 200);
        Assert.NotNull(elementos);
        Assert.True(elementos?.ContainsKey("data"));
    }

    [Fact]
    public async Task GetAllUsers_Fail_NoToken()
    {
        // Act
        var response = await _http.GetAsync("/api/admin/users");

        // Assert
        Assert.True((int)response.StatusCode == 401);
    }

    [Fact]
    public async Task GetAllUsers_Fail_EmpleadoNoAutorizado()
    {
        // Arrange — crear empleado con admin
        await AuthenticateAsync();
        var emailEmpleado = $"emp.{Guid.NewGuid()}@inventarios.com";

        await _http.PostAsJsonAsync("/api/Register", new
        {
            name = "Empleado",
            email = emailEmpleado,
            password = "Empleado@1234",
            confirmPassword = "Empleado@1234",
            role = "Empleado"
        });

        // Cliente nuevo desde el factory para el empleado
        var empleadoClient = CreateEmpleadoClient();
        var loginResp = await empleadoClient.PostAsJsonAsync("/api/Auth/login", new
        {
            email = emailEmpleado,
            password = "Empleado@1234"
        });

        var loginBody = await loginResp.Content.ReadAsStringAsync();
        var loginJson = JsonSerializer.Deserialize<JsonElement>(loginBody);
        var empleadoToken = loginJson.GetProperty("data").GetProperty("token").GetString();

        empleadoClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", empleadoToken);

        // Act
        var response = await empleadoClient.GetAsync("/api/admin/users");

        // Assert
        Assert.True((int)response.StatusCode == 403);
    }

    [Fact]
    public async Task ResetPassword_Ok()
    {
        // Arrange
        await AuthenticateAsync();
        var userId = await CrearUsuarioYObtenerIdAsync();

        var request = new
        {
            newPassword = "NuevoPass@1234",
            confirmNewPassword = "NuevoPass@1234"
        };

        // Act
        var response = await _http.PutAsJsonAsync(
            $"/api/admin/users/{userId}/reset-password", request);
        var body = await response.Content.ReadAsStringAsync();
        var elementos = JsonSerializer.Deserialize<Dictionary<string, object>>(body);

        // Assert
        Assert.True(response.IsSuccessStatusCode && (int)response.StatusCode == 200);
        Assert.NotNull(elementos);
    }

    [Fact]
    public async Task ResetPassword_Fail_UserNotFound()
    {
        // Arrange
        await AuthenticateAsync();
        var request = new
        {
            newPassword = "NuevoPass@1234",
            confirmNewPassword = "NuevoPass@1234"
        };

        // Act
        var response = await _http.PutAsJsonAsync(
            $"/api/admin/users/{Guid.NewGuid()}/reset-password", request);

        // Assert
        Assert.True((int)response.StatusCode == 404);
    }

    [Fact]
    public async Task ResetPassword_Fail_PasswordMismatch()
    {
        // Arrange
        await AuthenticateAsync();
        var userId = await CrearUsuarioYObtenerIdAsync();

        var request = new
        {
            newPassword = "NuevoPass@1234",
            confirmNewPassword = "Diferente@1234"
        };

        // Act
        var response = await _http.PutAsJsonAsync(
            $"/api/admin/users/{userId}/reset-password", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task DeleteUser_Ok()
    {
        // Arrange
        await AuthenticateAsync();
        var userId = await CrearUsuarioYObtenerIdAsync();

        // Act
        var response = await _http.DeleteAsync($"/api/admin/users/{userId}");
        var body = await response.Content.ReadAsStringAsync();
        var elementos = JsonSerializer.Deserialize<Dictionary<string, object>>(body);

        // Assert
        Assert.True(response.IsSuccessStatusCode && (int)response.StatusCode == 200);
        Assert.NotNull(elementos);
    }

    [Fact]
    public async Task DeleteUser_Fail_UserNotFound()
    {
        // Arrange
        await AuthenticateAsync();

        // Act
        var response = await _http.DeleteAsync($"/api/admin/users/{Guid.NewGuid()}");

        // Assert
        Assert.True((int)response.StatusCode == 404);
    }

    [Fact]
    public async Task DeleteUser_Fail_NoToken()
    {
        // Act
        var response = await _http.DeleteAsync($"/api/admin/users/{Guid.NewGuid()}");

        // Assert
        Assert.True((int)response.StatusCode == 401);
    }
}