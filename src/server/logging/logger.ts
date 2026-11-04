import pino, { type DestinationStream, type Logger } from "pino";

const REDACT_PATHS = [
  "password",
  "token",
  "access_token",
  "refresh_token",
  "accessToken",
  "refreshToken",
  "cookie",
  "cookies",
  "authorization",
  "secret",
  "serviceRoleKey",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_ANON_KEY",
  "*.password",
  "*.token",
  "*.cookie",
  "*.authorization",
];

export function createLogger(
  destination?: DestinationStream,
): Logger {
  const level = process.env.LOG_LEVEL ?? "info";

  return pino(
    {
      level: isPinoLevel(level) ? level : "info",
      timestamp: pino.stdTimeFunctions.isoTime,
      redact: {
        paths: REDACT_PATHS,
        censor: "[Redacted]",
      },
      base: undefined,
    },
    destination,
  );
}

function isPinoLevel(
  value: string,
): value is "fatal" | "error" | "warn" | "info" | "debug" | "trace" {
  return ["fatal", "error", "warn", "info", "debug", "trace"].includes(value);
}

export const logger = createLogger();

export function safeErrorContext(error: unknown): {
  name: string;
  code?: string;
  status?: number;
} {
  if (error instanceof Error) {
    const context: { name: string; code?: string; status?: number } = {
      name: error.name,
    };

    if ("code" in error && typeof error.code === "string") {
      context.code = error.code;
    }

    if ("status" in error && typeof error.status === "number") {
      context.status = error.status;
    }

    return context;
  }

  return { name: "unknown" };
}
