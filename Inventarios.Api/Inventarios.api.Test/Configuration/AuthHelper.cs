using System.Net.Http.Json;
using System.Text.Json;

namespace Inventarios.api.Test.Configuration;

public static class AuthHelper
{
    public static async Task<string> GetAdminTokenAsync(HttpClient http)
    {
        var request = new
        {
            email = "diana2@inventarios.com",
            password = "Admin@1234"
        };

        var response = await http.PostAsJsonAsync("/api/Auth/login", request);
        var body = await response.Content.ReadAsStringAsync();

        if (response.IsSuccessStatusCode)
        {
            var json = JsonSerializer.Deserialize<JsonElement>(body);
            var token = json
                .GetProperty("data")
                .GetProperty("token")
                .GetString();

            if (!string.IsNullOrEmpty(token))
                return token;
        }

        throw new InvalidOperationException(
            $"No se pudo obtener token. Status: {response.StatusCode}. Body: {body}");
    }
}