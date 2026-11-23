export function getCurrentUserName(): string | null {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  const encodedPayload = token.split('.')[1];
  if (!encodedPayload) {
    return null;
  }

  let claims: Record<string, unknown>;
  try {
    const base64 = encodedPayload.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    claims = JSON.parse(atob(paddedBase64)) as Record<string, unknown>;
  } catch {
    return null;
  }

  const user = claims.user;
  const nestedUser = typeof user === 'object' && user !== null ? user : undefined;
  const value =
    claims.userName ??
    claims.username ??
    claims.name ??
    claims.sub ??
    nestedUser?.userName ??
    nestedUser?.username ??
    nestedUser?.name;

  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  return null;
}
