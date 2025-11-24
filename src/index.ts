import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { prisma } from "./lib/prisma.js";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.get("/users", async (c) => {
  const users = await prisma.user.findMany();
  return c.json(users);
});
app.get("/users/:id", async (c) => {
  const id = Number(c.req.param("id"));
  const user = await prisma.user.findUnique({
    where: { id },
  });
  if (user) {
    return c.json(user);
  } else {
    return c.json({ error: "User not found" }, 404);
  }
});
app.post("/users", async (c) => {
  const { email, name } = await c.req.json();

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return c.json({ error: "Email already in use" }, 409);
    }
    const newUser = await prisma.user.create({
      data: { email, name },
    });
    return c.json(newUser, 201);
  } catch (error) {
    return c.json({ error: "Failed to create user" }, 400);
  }
});

if (process.env.NODE_ENV !== "production") {
  serve(
    {
      fetch: app.fetch,
      port: 3000,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    }
  );
}
export default app;
