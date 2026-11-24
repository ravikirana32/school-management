import { SignJWT, jwtVerify } from "jose";

const issuer = "school-management-saas";
const audience = "school-management-api";

function signingKey(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret || secret.length < 32) throw new Error("JWT_ACCESS_SECRET must contain at least 32 characters");
  return new TextEncoder().encode(secret);
}

export type AccessClaims = {
  sub: string;
  sessionId: string;
  organizationId?: string;
  schoolId?: string;
};

export async function issueAccessToken(claims: AccessClaims): Promise<string> {
  return new SignJWT({ sessionId: claims.sessionId, organizationId: claims.organizationId, schoolId: claims.schoolId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuer(issuer).setAudience(audience)
    .setIssuedAt().setExpirationTime("10m").sign(signingKey());
}

export async function verifyAccessToken(token: string): Promise<AccessClaims> {
  const { payload } = await jwtVerify(token, signingKey(), { issuer, audience, algorithms: ["HS256"] });
  if (typeof payload.sub !== "string" || typeof payload.sessionId !== "string") throw new Error("Invalid token claims");
  return {
    sub: payload.sub,
    sessionId: payload.sessionId,
    organizationId: typeof payload.organizationId === "string" ? payload.organizationId : undefined,
    schoolId: typeof payload.schoolId === "string" ? payload.schoolId : undefined
  };
}
