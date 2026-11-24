import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../../app.js";

const authBase = "/api/v1/auth";

describe("P464 authentication negative-path and validation HTTP contracts", () => {
  it("rejects registration with invalid email before persistence", async () => {
    const response = await request(app).post(`${authBase}/register`).send({ email: "invalid", password: "ValidPassword123", displayName: "Test User" });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: "Invalid registration details" });
  });


  it("rejects registration with a short password", async () => {
    const response = await request(app).post(`${authBase}/register`).send({ email: "test@example.invalid", password: "short", displayName: "Test User" });
    expect(response.status).toBe(400);
  });

  it("rejects registration with an unknown property because the schema is strict", async () => {
    const response = await request(app).post(`${authBase}/register`).send({ email: "test@example.invalid", password: "ValidPassword123", displayName: "Test User", admin: true });
    expect(response.status).toBe(400);
  });

  it("rejects login when email is missing", async () => {
    const response = await request(app).post(`${authBase}/login`).send({ password: "any-password" });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: "Invalid credentials" });
  });

  it("rejects login when password is missing", async () => {
    const response = await request(app).post(`${authBase}/login`).send({ email: "test@example.invalid" });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: "Invalid credentials" });
  });

  it("rejects login with unknown fields", async () => {
    const response = await request(app).post(`${authBase}/login`).send({ email: "test@example.invalid", password: "ValidPassword123", extra: "not-allowed" });
    expect(response.status).toBe(400);
  });

  it("rejects refresh tokens shorter than the contract minimum", async () => {
    const response = await request(app).post(`${authBase}/refresh`).send({ refreshToken: "short-token" });
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: "Invalid refresh token" });
  });

  it("rejects refresh payloads with unknown fields", async () => {
    const response = await request(app).post(`${authBase}/refresh`).send({ refreshToken: "x".repeat(32), unexpected: true });
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: "Invalid refresh token" });
  });

  it("rejects password reset when token is missing", async () => {
    const response = await request(app).post(`${authBase}/password/reset`).send({ password: "LongEnoughPassword123" });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: "Invalid password reset details" });
  });

  it("rejects password reset with a short token", async () => {
    const response = await request(app).post(`${authBase}/password/reset`).send({ token: "short", password: "LongEnoughPassword123" });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: "Invalid password reset details" });
  });

  it("rejects password reset when the password is below the minimum length", async () => {
    const response = await request(app).post(`${authBase}/password/reset`).send({ token: "t".repeat(32), password: "short" });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: "Invalid password reset details" });
  });
});
