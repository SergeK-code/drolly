export type AppRole = "customer" | "admin";

const MAX_RETURN_TO_LENGTH = 512;

export function defaultPathForRole(role: AppRole): "/admin" | "/account" {
  return role === "admin" ? "/admin" : "/account";
}

export function firstQueryValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function sanitizeReturnTo(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  let candidate = value.trim();
  if (candidate.length === 0 || candidate.length > MAX_RETURN_TO_LENGTH) {
    return null;
  }

  if (candidate.includes("\\") || /%5c/i.test(candidate)) {
    return null;
  }

  try {
    candidate = decodeURIComponent(candidate).trim();
  } catch {
    return null;
  }

  if (!candidate.startsWith("/")) {
    return null;
  }

  if (candidate.startsWith("//") || candidate.startsWith("/\\")) {
    return null;
  }

  if (candidate.includes("://") || candidate.includes("\\")) {
    return null;
  }

  if (/[\u0000-\u001F]/.test(candidate)) {
    return null;
  }

  const pathOnly = pathnameOf(candidate);

  if (
    pathOnly === "/sign-in" ||
    pathOnly === "/sign-up" ||
    pathOnly.startsWith("/sign-in/") ||
    pathOnly.startsWith("/sign-up/") ||
    pathOnly.startsWith("/api/")
  ) {
    return null;
  }

  return candidate;
}

export function resolvePostAuthPath(
  returnTo: unknown,
  role: AppRole,
): string {
  const safe = sanitizeReturnTo(returnTo);

  if (!safe) {
    return defaultPathForRole(role);
  }

  if (isAdminPath(safe) && role !== "admin") {
    return "/account";
  }

  return safe;
}

export function signInHref(returnTo: string): string {
  return `/sign-in?returnTo=${encodeURIComponent(returnTo)}`;
}

export function withNotice(href: string, notice: string): string {
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}notice=${encodeURIComponent(notice)}`;
}

function pathnameOf(path: string): string {
  return path.split(/[?#]/, 1)[0] ?? "";
}

function isAdminPath(path: string): boolean {
  const pathOnly = pathnameOf(path);
  return pathOnly === "/admin" || pathOnly.startsWith("/admin/");
}
