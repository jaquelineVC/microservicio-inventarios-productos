export class AuthResponse {
  token: string;
  name: string;
  email: string;
  role: string;
  expiresAt: Date;

  constructor(token: string, name: string, email: string, role: string, expiresAt: Date) {
    this.token = token;
    this.name = name;
    this.email = email;
    this.role = role;
    this.expiresAt = expiresAt;
  }
}