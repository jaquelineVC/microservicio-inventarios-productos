using Inventarios.api.Application.UseCases;
using Inventarios.api.Domain.Dtos.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventarios.api.Controllers;

[ApiController]
[Route("api/admin")]
[Produces("application/json")]
[Authorize(Roles = "Admin")]
public sealed class AdminDeleteUserController : ControllerBase
{
    private readonly DeleteUserUseCase _deleteUserUseCase;

    public AdminDeleteUserController(DeleteUserUseCase deleteUserUseCase)
    {
        _deleteUserUseCase = deleteUserUseCase;
    }

    /// <summary>Elimina un usuario por ID.</summary>
    [HttpDelete("users/{id:guid}")]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status200OK)]
    [ProducesResponseType<ApiResponse<object>>(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> DeleteUser(Guid id, CancellationToken ct)
    {
        var result = await _deleteUserUseCase.ExecuteAsync(id, ct);

        if (result.IsFailure)
            return NotFound(ApiResponse<object>.Fail(result.Error!));

        return Ok(ApiResponse<object>.Ok(new { }, "Usuario eliminado exitosamente."));
    }
}