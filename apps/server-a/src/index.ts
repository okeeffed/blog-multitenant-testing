import { serve } from "@hono/node-server";
import { Hono } from "hono";
import axios from "axios";
import { z } from "zod/v4";
import { v4 } from "uuid";

const UsersPostBody = z.object({
  name: z.string(),
});

interface User {
  id: string;
  name: string;
}

class InternalServerError {
  readonly _tag = "InternalServerError";
  readonly value = {
    message: "Internal Server Error",
  };
}

class UnhandledResponseTagError {
  readonly _tag = "UnhandledResponseTag";
  readonly value = {
    message: "Internal Server Error",
  };
}

class ValidationError {
  readonly _tag = "ValidationError";
  readonly value: {
    message: "Bad Request";
    details: string;
  };

  constructor(zodError: z.ZodError) {
    this.value = {
      message: "Bad Request",
      details: z.prettifyError(zodError),
    };
  }
}

class UserCreatedResponse {
  readonly _tag = "UserCreated";
  readonly value: User;

  constructor(newUser: User) {
    this.value = newUser;
  }
}

class NewUserNotification {
  readonly _tag = "NewUser";
  readonly value: User;

  constructor(newUser: User) {
    this.value = newUser;
  }
}

const app = new Hono();
app.post("/users", async (c) => {
  try {
    const body = await c.req.json();
    const userBodyResult = UsersPostBody.safeParse(body);
    if (!userBodyResult.success) {
      c.status(400);
      return c.json(new ValidationError(userBodyResult.error));
    }

    // We aren't storing this. Just illustrating some adjustments to the value
    const newUser = {
      id: v4(),
      name: userBodyResult.data.name,
    };

    const res = await axios.post(
      "http://localhost:3001/notifications",
      new NewUserNotification(newUser),
    );

    switch (res.data._tag) {
      case "ItemQueued":
        return c.json(new UserCreatedResponse(newUser));
      default:
        return c.json(new UnhandledResponseTagError());
    }
  } catch (err) {
    console.error("Something went wrong", err);
    return c.json(new InternalServerError());
  }
});

serve({
  fetch: app.fetch,
  port: 3000,
});
