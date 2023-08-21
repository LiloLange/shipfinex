import request from "supertest";
import createServer from "../index";

describe("Post /", () => {
  let server;

  beforeEach(async () => {
    server = await createServer();
  });

  afterEach(async () => {
    await server.stop();
  });

  it("should return status code 201", async () => {
    const userData = {
      firstName: "Lilo",
      lastName: "Lange",
      email: "sage123@gmail.com",
      phoneNumber: "4532623152",
      password: "codemaster",
      role: "investor",
    };

    const response = await request((await server).listener)
      .post("/api/v1/user/register")
      .send(userData);

    expect(response.statusCode).toEqual(201);
  }, 10000);
});
