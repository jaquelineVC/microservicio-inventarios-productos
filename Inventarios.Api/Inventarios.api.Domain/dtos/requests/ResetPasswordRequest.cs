namespace Inventarios.api.Domain.Dtos.Requests;

public sealed record ResetPasswordRequest(
    string NewPassword,
    string ConfirmNewPassword
);