import request from "supertest";
import app from "../src/app.js";

export { request, app };

export const uniqueEmail = () =>
  `test_${Date.now()}_${Math.random().toString(36).slice(2)}@boardsync.test`;

export const signup = async (overrides = {}) => {
  const user = {
    name: "Test User",
    email: uniqueEmail(),
    password: "Password123",
    ...overrides,
  };

  const response = await request(app).post("/api/auth/signup").send(user);
  return { user, response };
};

export const login = async (email, password = "Password123") => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email, password });

  return response.body.data?.token;
};

export const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});
