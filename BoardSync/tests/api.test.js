import request from "supertest";
import { app, authHeader, login, signup } from "./helpers.js";
import Workspace from "../src/models/Workspace.js";
import Task from "../src/models/Task.js";

describe("Authentication API", () => {
  test("signup succeeds", async () => {
    const { response } = await signup();

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBeDefined();
    expect(response.body.data.password).toBeUndefined();
  });

  test("signup fails with a duplicate email", async () => {
    const { user } = await signup();
    const response = await request(app).post("/api/auth/signup").send(user);

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/already exists/i);
  });

  test("login succeeds with the correct password", async () => {
    const { user } = await signup();
    const token = await login(user.email);

    expect(token).toEqual(expect.any(String));
  });

  test("login fails with the wrong password", async () => {
    const { user } = await signup();
    const response = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "WrongPassword123" });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  test("/api/auth/me fails without a token", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
  });

  test("/api/auth/me succeeds with a valid token", async () => {
    const { user } = await signup();
    const token = await login(user.email);
    const response = await request(app)
      .get("/api/auth/me")
      .set(authHeader(token));

    expect(response.status).toBe(200);
    expect(response.body.data.email).toBe(user.email);
    expect(response.body.data.password).toBeUndefined();
  });
});

describe("Workspace API", () => {
  test("creating a workspace makes the creator the owner", async () => {
    const { user, response: signupResponse } = await signup();
    const token = await login(user.email);
    const response = await request(app)
      .post("/api/workspaces")
      .set(authHeader(token))
      .send({ name: "Owned Workspace" });

    expect(response.status).toBe(201);
    expect(String(response.body.data.owner)).toBe(signupResponse.body.data._id);
    expect(response.body.data.members).toHaveLength(1);
    expect(String(response.body.data.members[0].user)).toBe(
      signupResponse.body.data._id
    );
    expect(response.body.data.members[0].role).toBe("owner");
  });

  test("a non-member cannot fetch a workspace", async () => {
    const { user: owner } = await signup();
    const ownerToken = await login(owner.email);
    const workspaceResponse = await request(app)
      .post("/api/workspaces")
      .set(authHeader(ownerToken))
      .send({ name: "Private Workspace" });

    const { user: outsider } = await signup();
    const outsiderToken = await login(outsider.email);
    const response = await request(app)
      .get(`/api/workspaces/${workspaceResponse.body.data._id}`)
      .set(authHeader(outsiderToken));

    expect(response.status).toBe(403);
  });
});

const createTaskFixture = async () => {
  const { user: owner } = await signup({ name: "Owner" });
  const ownerToken = await login(owner.email);
  const workspaceResponse = await request(app)
    .post("/api/workspaces")
    .set(authHeader(ownerToken))
    .send({ name: "Task Workspace" });
  const boardResponse = await request(app)
    .post("/api/boards")
    .set(authHeader(ownerToken))
    .send({
      name: "Task Board",
      workspace: workspaceResponse.body.data._id,
    });
  const taskResponse = await request(app)
    .post("/api/tasks")
    .set(authHeader(ownerToken))
    .send({
      title: "Test Task",
      board: boardResponse.body.data._id,
    });

  return {
    ownerToken,
    workspaceId: workspaceResponse.body.data._id,
    boardId: boardResponse.body.data._id,
    taskId: taskResponse.body.data._id,
  };
};

describe("Task API", () => {
  test("a member cannot delete a task", async () => {
    const fixture = await createTaskFixture();
    const { user: member, response: memberSignup } = await signup({
      name: "Member",
    });
    const memberToken = await login(member.email);

    await Workspace.findByIdAndUpdate(fixture.workspaceId, {
      $push: {
        members: { user: memberSignup.body.data._id, role: "member" },
      },
    });

    const response = await request(app)
      .delete(`/api/tasks/${fixture.taskId}`)
      .set(authHeader(memberToken));

    expect(response.status).toBe(403);
    expect(await Task.findById(fixture.taskId)).not.toBeNull();
  });

  test("an owner can delete a task", async () => {
    const fixture = await createTaskFixture();
    const response = await request(app)
      .delete(`/api/tasks/${fixture.taskId}`)
      .set(authHeader(fixture.ownerToken));

    expect(response.status).toBe(200);
    expect(await Task.findById(fixture.taskId)).toBeNull();
  });

  test("task status rejects invalid enum values", async () => {
    const fixture = await createTaskFixture();
    const response = await request(app)
      .post("/api/tasks")
      .set(authHeader(fixture.ownerToken))
      .send({
        title: "Invalid Status Task",
        board: fixture.boardId,
        status: "blocked",
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("ValidationError");
  });
});
