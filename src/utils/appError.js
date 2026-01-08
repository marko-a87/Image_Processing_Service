class AppError extends Error {
  constructor(message, statusCode, errorCode = null) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true; // Flag for operational vs programming errors

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, "VALIDATION_ERROR");
    this.field = field;
  }
}
// class DatabaseError extends AppError {
//   constructor(message) {
//     super(message, 500, "DATABASE_ERROR");
//   }
// }

// class AuthError extends AppError {
//   constructor(message, statusCode = 401,errorCode = "AUTH_ERROR") {
//     super(message, statusCode, errorCode);
//   }
// }

export { AppError, ValidationError };
