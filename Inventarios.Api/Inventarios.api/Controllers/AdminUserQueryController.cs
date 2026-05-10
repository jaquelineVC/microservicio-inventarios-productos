using Inventarios.api.Application.UseCases;
using Inventarios.api.Domain.Dtos.Responses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Inventarios.api.Controllers;

[ApiController]
[Route("api/admin")]
[Produces("application/json")]
[Authorize(Roles = "Admin")]
public sealed class AdminUserQueryController : ControllerBase
{
    private readonly GetAllUsersUseCase _getAllUsersUseCase;

    public AdminUserQueryController(GetAllUsersUseCase getAllUsersUseCase)
    {
        _getAllUsersUseCase = getAllUsersUseCase;
    }

    /// <summary>Obtiene todos los usuarios.</summary>
    [HttpGet("users")]
    [ProducesResponseType<ApiResponse<IEnumerable<UserResponse>>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> GetAllUsers(CancellationToken ct)
    {
        var result = await _getAllUsersUseCase.ExecuteAsync(ct);
        return Ok(ApiResponse<IEnumerable<UserResponse>>.Ok(result.Value!));
    }
}