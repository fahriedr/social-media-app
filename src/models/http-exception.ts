export class HttpException extends Error {
  statusCode: number;
  success: boolean;
  details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.success = false
    this.details = details;
    Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
    Error.captureStackTrace(this);
  }
}