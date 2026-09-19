export interface AccessTokenClaims {
  sub: string;
  email: string;
  exp: number;
}

export function decodeAccessToken(token: string): AccessTokenClaims {
  const [, payload] = token.split('.');
  const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = atob(
    base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='),
  );
  return JSON.parse(json) as AccessTokenClaims;
}
