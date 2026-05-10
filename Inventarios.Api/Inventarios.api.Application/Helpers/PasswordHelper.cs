namespace Inventarios.api.Application.Helpers;

public static class PasswordHelper
{
    private const string SpecialCharacters = "!@#$%^&*()_+-=[]{}|;':\",./<>?";

    public static bool HasValidComplexity(string password) =>
        password.Any(char.IsUpper) &&
        password.Any(char.IsLower) &&
        password.Any(char.IsDigit) &&
        password.Any(c => SpecialCharacters.Contains(c));

    public static bool HasMinimumLength(string password, int minLength = 8) =>
        password.Length >= minLength;

    public static bool HasMaximumLength(string password, int maxLength = 128) =>
        password.Length <= maxLength;
}