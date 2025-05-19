import request from "supertest";
import { describe, expect, it } from "vitest";

describe("GET /", () => {
  it('returns 200 and "Hello Vitest"', async () => {
    const res = await request(app.callback()).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toBe("Hello Vitest");
  });
});
