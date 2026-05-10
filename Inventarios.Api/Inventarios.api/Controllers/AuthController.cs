using Inventarios.api.Application.UseCases;
using Inventarios.api.Domain.Dtos.Requests;
using Inventarios.api.Domain.Dtos.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventarios.api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public sealed class AuthController : ControllerBase
{
    private readonly LoginUserUseCase _loginUseCase;

    public AuthController(LoginUserUseCase loginUseCase)
    {
        _loginUseCase = loginUseCase;
    }

    /// <summary>Autentica un usuario y retorna un token JWT.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType<ApiResponse<AuthResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login([FromBody] LoginRequest request, CancellationToken ct)
    {
        var result = await _loginUseCase.ExecuteAsync(request, ct);

        if (result.IsFailure)
            return Unauthorized(ApiResponse<object>.Fail(result.Error!));

        return Ok(ApiResponse<AuthResponse>.Ok(result.Value!, "Autenticación exitosa."));
    }
}