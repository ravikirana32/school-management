import { describe, expect, it } from "vitest";
import request from "supertest";
import { app } from "../../app.js";

const authBase = "/api/v1/auth";

describe("P463 authentication HTTP integration contracts", () => {
  it("rejects malformed login input before credential lookup", async () => {
    const response = await request(app).post(`${authBase}/login`).send({ email: "not-an-email" });
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({ error: "Invalid credentials" });
  });

  it("rejects malformed refresh input without a token", async () => {
    const response = await request(app).post(`${authBase}/refresh`).send({});
    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({ error: "Invalid refresh token" });
  });

  it("returns generic forgot-password response without account disclosure", async () => {
    const response = await request(app).post(`${authBase}/password/forgot`).send({ email: "person@example.invalid" });
    expect(response.status).toBe(202);
    expect(response.body.message).toBe("If the account exists, reset instructions will be sent.");
  });

  it("accepts malformed logout input safely and returns no content", async () => {
    const response = await request(app).post(`${authBase}/logout`).send({ refreshToken: "" });
    expect(response.status).toBe(204);
    expect(response.text).toBe("");
  });

  it("protects session inventory from anonymous requests", async () => {
    const response = await request(app).get(`${authBase}/sessions`);
    expect(response.status).toBe(401);
  });

  it("protects MFA status from anonymous requests", async () => {
    const response = await request(app).get(`${authBase}/mfa/status`);
    expect(response.status).toBe(401);
  });
});
