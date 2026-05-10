using Inventarios.api.Domain.Entities;
using Inventarios.api.Domain.ValueObjects;
using Xunit;

namespace Inventarios.api.Test.Tests;

public class UnitTest
{
    // ── Email Value Object ──

    [Fact]
    public void Email_ToString_ReturnsValue()
    {
        var result = Email.Create("test@inventarios.com");
        Assert.True(result.IsSuccess);
        Assert.Equal("test@inventarios.com", result.Value!.ToString());
    }

    [Fact]
    public void Email_Equals_SameValue_ReturnsTrue()
    {
        var email1 = Email.Create("test@inventarios.com").Value!;
        var email2 = Email.Create("test@inventarios.com").Value!;
        Assert.True(email1.Equals(email2));
    }

    [Fact]
    public void Email_Equals_DifferentValue_ReturnsFalse()
    {
        var email1 = Email.Create("test1@inventarios.com").Value!;
        var email2 = Email.Create("test2@inventarios.com").Value!;
        Assert.False(email1.Equals(email2));
    }

    [Fact]
    public void Email_Equals_Null_ReturnsFalse()
    {
        var email = Email.Create("test@inventarios.com").Value!;
        Assert.False(email.Equals(null));
    }

    [Fact]
    public void Email_GetHashCode_ReturnsConsistentValue()
    {
        var email = Email.Create("test@inventarios.com").Value!;
        Assert.Equal(email.GetHashCode(), email.GetHashCode());
    }

    // ── User Entity ───────────────────────────────────────────────────

    [Fact]
    public void User_Deactivate_SetsIsActiveFalse()
    {
        var userResult = User.Create("Test User", "test@test.com", "hashedpassword");
        Assert.True(userResult.IsSuccess);

        var user = userResult.Value!;
        user.Deactivate();

        Assert.False(user.IsActive);
    }

    [Fact]
    public void User_Activate_SetsIsActiveTrue()
    {
        var userResult = User.Create("Test User", "test@test.com", "hashedpassword");
        Assert.True(userResult.IsSuccess);

        var user = userResult.Value!;
        user.Deactivate();
        user.Activate();

        Assert.True(user.IsActive);
    }

    [Fact]
    public void User_IsLocked_WhenLockedUntilInFuture_ReturnsTrue()
    {
        var userResult = User.Create("Test User", "test@test.com", "hashedpassword");
        var user = userResult.Value!;

        user.RegisterFailedLogin();
        user.RegisterFailedLogin();
        user.RegisterFailedLogin();
        user.RegisterFailedLogin();
        user.RegisterFailedLogin();

        Assert.True(user.IsLocked());
    }

    [Fact]
    public void User_RegisterSuccessfulLogin_ResetsFailedAttempts()
    {
        var userResult = User.Create("Test User", "test@test.com", "hashedpassword");
        var user = userResult.Value!;

        user.RegisterFailedLogin();
        user.RegisterFailedLogin();
        user.RegisterSuccessfulLogin();

        Assert.Equal(0, user.FailedLoginAttempts);
        Assert.False(user.IsLocked());
    }

    [Fact]
    public void User_Create_Fail_EmailInvalido()
    {
        var result = User.Create("Test", "emailinvalido", "hash");
        Assert.True(result.IsFailure);
    }

    [Fact]
    public void User_Create_Fail_NombreVacio()
    {
        var result = User.Create("", "test@test.com", "hash");
        Assert.True(result.IsFailure);
    }
}