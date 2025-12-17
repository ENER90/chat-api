import request from "supertest";
import app from "../app";

describe("Smoke tests", () => {
  it("GET /health responde OK", async () => {
    const res = await request(app).get("/health").expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        status: "ok",
        message: "Chat API is running",
      })
    );
    expect(typeof res.body.timestamp).toBe("string");
  });

  it("GET /api expone info básica", async () => {
    const res = await request(app).get("/api").expect(200);

    expect(res.body).toEqual(
      expect.objectContaining({
        message: "Real-time Chat API",
        version: "1.0.0",
      })
    );
    expect(res.body.endpoints).toBeDefined();
  });
});

