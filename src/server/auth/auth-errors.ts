import { AppError } from "@/server/errors/app-error";

export function unauthenticatedError(): AppError {
  return new AppError("UNAUTHENTICATED", 401, "You need to sign in.");
}

export function forbiddenError(): AppError {
  return new AppError(
    "FORBIDDEN",
    403,
    "You do not have permission to do that.",
  );
}

export function invalidCredentialsError(): AppError {
  return new AppError("UNAUTHENTICATED", 401, "Invalid email or password.");
}

export function registrationFailedError(): AppError {
  return new AppError(
    "VALIDATION_ERROR",
    400,
    "Could not create the account.",
  );
}
