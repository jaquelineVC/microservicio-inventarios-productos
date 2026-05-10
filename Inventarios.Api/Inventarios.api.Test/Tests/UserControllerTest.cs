using System.Net.Http.Headers;
using System.Text.Json;
using Inventarios.api.Test.Configuration;
using Xunit;

namespace Inventarios.api.Test.Tests;

public class UserControllerTest : IClassFixture<ApiFactory>
{
    private readonly HttpClient _http;

    public UserControllerTest(ApiFactory factory)
    {
        _http = factory.CreateClient();
    }

    [Fact]
    public async Task Me_Ok()
    {
        // Arrange
        var token = await AuthHelper.GetAdminTokenAsync(_http);
        _http.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);

        // Act
        var response = await _http.GetAsync("/api/User/me");
        var body = await response.Content.ReadAsStringAsync();
        var elementos = JsonSerializer.Deserialize<Dictionary<string, object>>(body);

        // Assert
        Assert.True(response.IsSuccessStatusCode && (int)response.StatusCode == 200);
        Assert.NotNull(elementos);
        Assert.True(elementos?.ContainsKey("data"));
    }

    [Fact]
    public async Task Me_Fail_NoToken()
    {
        // Act
        var response = await _http.GetAsync("/api/User/me");

        // Assert
        Assert.True((int)response.StatusCode == 401);
    }
}