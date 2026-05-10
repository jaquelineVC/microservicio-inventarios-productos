export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];

  private constructor(success: boolean, message: string, data?: T, errors?: string[]) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }

  static ok<T>(data: T, message = 'OK'): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }

  static fail<T>(message: string, errors?: string[]): ApiResponse<T> {
    return new ApiResponse<T>(false, message, undefined, errors);
  }
}