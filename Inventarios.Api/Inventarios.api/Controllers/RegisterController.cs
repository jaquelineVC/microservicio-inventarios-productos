using Inventarios.api.Application.UseCases;
using Inventarios.api.Domain.Dtos.Requests;
using Inventarios.api.Domain.Dtos.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventarios.api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
[Authorize(Roles = "Admin")]
public sealed class RegisterController : ControllerBase
{
    private readonly RegisterUserUseCase _registerUseCase;

    public RegisterController(RegisterUserUseCase registerUseCase)
    {
        _registerUseCase = registerUseCase;
    }

    /// <summary>Registra un nuevo usuario. Solo Admin.</summary>
    [HttpPost]
    [ProducesResponseType<ApiResponse<Guid>>(StatusCodes.Status201Created)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request, CancellationToken ct)
    {
        var result = await _registerUseCase.ExecuteAsync(request, ct);

        if (result.IsFailure)
            return BadRequest(ApiResponse<object>.Fail(result.Error!));

        return CreatedAtAction(nameof(Register),
            ApiResponse<Guid>.Ok(result.Value!, "Usuario registrado exitosamente."));
    }
}