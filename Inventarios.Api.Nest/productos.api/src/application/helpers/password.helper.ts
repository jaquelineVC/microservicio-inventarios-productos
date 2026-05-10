/**
 * Helper estático para validaciones de contraseña.
 * Mismo concepto que en Inventarios.Api (.NET)
 */
export class PasswordHelper {
  private static readonly specialCharacters = '!@#$%^&*()_+-=[]{}|;\':",./<>?';

  static hasValidComplexity(password: string): boolean {
    return (
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      [...password].some(c => PasswordHelper.specialCharacters.includes(c))
    );
  }

  static hasMinimumLength(password: string, minLength = 8): boolean {
    return password.length >= minLength;
  }

  static hasMaximumLength(password: string, maxLength = 128): boolean {
    return password.length <= maxLength;
  }
}