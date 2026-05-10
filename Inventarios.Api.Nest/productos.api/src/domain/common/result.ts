export class Result<T> {
  readonly isSuccess: boolean;
  readonly isFailure: boolean;
  readonly value?: T;
  readonly error?: string;

  private constructor(isSuccess: boolean, value?: T, error?: string) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.value = value;
    this.error = error;
  }

  static success<T>(value: T): Result<T> {
    return new Result(true, value);
  }

  static failure<T>(error: string): Result<T> {
    return new Result<T>(false, undefined, error);
  }
}

export class VoidResult {
  readonly isSuccess: boolean;
  readonly isFailure: boolean;
  readonly error?: string;

  private constructor(isSuccess: boolean, error?: string) {
    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
  }

  static success(): VoidResult {
    return new VoidResult(true);
  }

  static failure(error: string): VoidResult {
    return new VoidResult(false, error);
  }
}