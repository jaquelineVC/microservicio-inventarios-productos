using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using Inventarios.api.Test.Configuration;
using Xunit;

namespace Inventarios.api.Test.Tests;

public class RegisterControllerTest : IClassFixture<ApiFactory>
{
    private readonly HttpClient _http;
    private readonly ApiFactory _factory;

    public RegisterControllerTest(ApiFactory factory)
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

    [Fact]
    public async Task Register_Ok()
    {
        // Arrange
        await AuthenticateAsync();
        var request = new
        {
            name = "Empleado Test",
            email = $"empleado.{Guid.NewGuid()}@inventarios.com",
            password = "Empleado@1234",
            confirmPassword = "Empleado@1234",
            role = "Empleado"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);
        var body = await response.Content.ReadAsStringAsync();
        var elementos = JsonSerializer.Deserialize<Dictionary<string, object>>(body);

        // Assert
        Assert.True(response.IsSuccessStatusCode && (int)response.StatusCode == 201);
        Assert.NotNull(elementos);
        Assert.True(elementos?.ContainsKey("data"));
    }

    [Fact]
    public async Task Register_Fail_NoToken()
    {
        // Arrange — sin autenticar
        var request = new
        {
            name = "Sin Token",
            email = "sintoken@inventarios.com",
            password = "Empleado@1234",
            confirmPassword = "Empleado@1234",
            role = "Empleado"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);

        // Assert
        Assert.True((int)response.StatusCode == 401);
    }

    [Fact]
    public async Task Register_Fail_EmpleadoNoAutorizado()
    {
        // Arrange — registrar un empleado con admin
        await AuthenticateAsync();
        var emailEmpleado = $"emp.{Guid.NewGuid()}@inventarios.com";

        await _http.PostAsJsonAsync("/api/Register", new
        {
            name = "Empleado NoAuth",
            email = emailEmpleado,
            password = "Empleado@1234",
            confirmPassword = "Empleado@1234",
            role = "Empleado"
        });

        // Cliente nuevo desde el factory para el empleado
        var empleadoClient = CreateEmpleadoClient();
        var loginResponse = await empleadoClient.PostAsJsonAsync("/api/Auth/login", new
        {
            email = emailEmpleado,
            password = "Empleado@1234"
        });

        var loginBody = await loginResponse.Content.ReadAsStringAsync();
        var loginJson = JsonSerializer.Deserialize<JsonElement>(loginBody);
        var empleadoToken = loginJson.GetProperty("data").GetProperty("token").GetString();

        empleadoClient.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", empleadoToken);

        // Act — empleado intenta registrar otro usuario
        var response = await empleadoClient.PostAsJsonAsync("/api/Register", new
        {
            name = "Otro Usuario",
            email = $"otro.{Guid.NewGuid()}@inventarios.com",
            password = "Otro@1234",
            confirmPassword = "Otro@1234",
            role = "Empleado"
        });

        // Assert
        Assert.True((int)response.StatusCode == 403);
    }

    [Fact]
    public async Task Register_Fail_EmailDuplicado()
    {
        // Arrange
        await AuthenticateAsync();
        var request = new
        {
            name = "Duplicado",
            email = "diana2@inventarios.com",
            password = "Admin@1234",
            confirmPassword = "Admin@1234",
            role = "Admin"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task Register_Fail_PasswordMismatch()
    {
        // Arrange
        await AuthenticateAsync();
        var request = new
        {
            name = "Mismatch",
            email = $"mismatch.{Guid.NewGuid()}@inventarios.com",
            password = "Empleado@1234",
            confirmPassword = "Diferente@1234",
            role = "Empleado"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task Register_Fail_PasswordSinComplejidad()
    {
        // Arrange
        await AuthenticateAsync();
        var request = new
        {
            name = "Sin Complejidad",
            email = $"sincomplej.{Guid.NewGuid()}@inventarios.com",
            password = "password",
            confirmPassword = "password",
            role = "Empleado"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }

    [Fact]
    public async Task Register_Fail_RolInvalido()
    {
        // Arrange
        await AuthenticateAsync();
        var request = new
        {
            name = "Rol Invalido",
            email = $"rolinvalido.{Guid.NewGuid()}@inventarios.com",
            password = "Empleado@1234",
            confirmPassword = "Empleado@1234",
            role = "SuperAdmin"
        };

        // Act
        var response = await _http.PostAsJsonAsync("/api/Register", request);

        // Assert
        Assert.True((int)response.StatusCode == 400);
    }
}