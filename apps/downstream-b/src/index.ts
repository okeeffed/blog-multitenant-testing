import { serve } from "@hono/node-server";
import { Hono } from "hono";
import axios from "axios";
import { z } from "zod/v4";

const User = z.object({
  id: z.uuidv4(),
  name: z.string(),
});

const NotificationPostBody = z.object({
  _tag: z.string(), // could be an enum if we wanted to narrow down
  value: z.union([User]),
});

type User = z.infer<typeof User>;

class InternalServerError {
  readonly _tag = "InternalServerError";
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

class ItemQueuedResponse {
  readonly _tag = "ItemQueued";
}

class QueueError {
  readonly _tag = "QueueError";
  readonly value: unknown;

  constructor(value: unknown) {
    this.value = value;
  }
}

type Tag = "NewUser";

interface Notification<T extends object> {
  readonly _tag: Tag;
  readonly value: T;
}

class NewUserNotification implements Notification<User> {
  readonly _tag = "NewUser";
  readonly value: User;

  constructor(newUser: User) {
    this.value = newUser;
  }
}

const app = new Hono();

async function addToQueue(notification: NewUserNotification) {
  return axios.post("http://localhost:3002/queue", notification);
}

app.post("/notifications", async (c) => {
  try {
    const body = await c.req.json();
    const notificationBodyResult = NotificationPostBody.safeParse(body);
    if (!notificationBodyResult.success) {
      c.status(400);
      return c.json(new ValidationError(notificationBodyResult.error));
    }

    const res = await addToQueue(
      new NewUserNotification(notificationBodyResult.data.value),
    );

    switch (res.data._tag) {
      case "SuccessfullyQueued":
        return c.json(new ItemQueuedResponse());
      // Propagate the following errors back under one
      // unified error type for the sake of it.
      case "ValidationError":
      case "TimeoutError":
        return c.json(new QueueError(res.data));
      default:
        return c.json(new InternalServerError());
    }
  } catch (error) {
    console.error("Error processing notification", error);
    return c.json(new InternalServerError());
  }
});

serve({
  fetch: app.fetch,
  port: 3001,
});
