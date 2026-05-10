using Inventarios.api.Application.UseCases;
using Inventarios.api.Domain.Dtos.Requests;
using Inventarios.api.Domain.Dtos.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventarios.api.Controllers;

[ApiController]
[Route("api/admin")]
[Produces("application/json")]
[Authorize(Roles = "Admin")]
public sealed class AdminResetPasswordController : ControllerBase
{
    private readonly ResetPasswordUseCase _resetPasswordUseCase;

    public AdminResetPasswordController(ResetPasswordUseCase resetPasswordUseCase)
    {
        _resetPasswordUseCase = resetPasswordUseCase;
    }

    /// <summary>Resetea la contraseña de un usuario.</summary>
    [HttpPut("users/{id:guid}/reset-password")]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ResetPassword(Guid id, [FromBody] ResetPasswordRequest request, CancellationToken ct)
    {
        var result = await _resetPasswordUseCase.ExecuteAsync(id, request, ct);

        if (result.IsFailure)
        {
            if (result.Error == "Usuario no encontrado.")
                return NotFound(ApiResponse<object>.Fail(result.Error));

            return BadRequest(ApiResponse<object>.Fail(result.Error!));
        }

        return Ok(ApiResponse<object>.Ok(new { }, "Contraseña actualizada exitosamente."));
    }
}