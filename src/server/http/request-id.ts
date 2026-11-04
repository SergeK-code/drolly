const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function getRequestId(request: Request): string {
  const incoming = request.headers.get("x-request-id")?.trim();

  if (incoming && UUID_PATTERN.test(incoming)) {
    return incoming;
  }

  return crypto.randomUUID();
}
