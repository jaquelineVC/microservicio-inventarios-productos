using System.Text.RegularExpressions;

namespace Inventarios.api.Infraestructure.Helpers;

/// <summary>
/// Helper estático para detección de contenido malicioso en requests HTTP.
/// Principio SRP: solo sabe detectar patrones de inyección.
/// </summary>
public static class SanitizationHelper
{
    private static readonly Regex ScriptPattern =
        new(@"<script[\s\S]*?>[\s\S]*?<\/script>",
            RegexOptions.Compiled | RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(100));

    private static readonly Regex EventHandlerPattern =
        new(@"\bon\w+\s*=",
            RegexOptions.Compiled | RegexOptions.IgnoreCase, TimeSpan.FromMilliseconds(100));

    public static bool ContainsMaliciousContent(string content)
    {
       
            return ScriptPattern.IsMatch(content) ||
                   EventHandlerPattern.IsMatch(content) ||
                   content.Contains("javascript:", StringComparison.OrdinalIgnoreCase) ||
                   content.Contains("vbscript:", StringComparison.OrdinalIgnoreCase) ||
                   content.Contains("data:text/html", StringComparison.OrdinalIgnoreCase);
        
    }
}