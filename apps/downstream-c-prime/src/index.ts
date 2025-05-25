/**
 * This server is a stand-in as an "alternative"
 * version of Downstream-C.
 */
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { z } from "zod/v4";

const User = z.object({
  id: z.uuidv4(),
  name: z.string(),
});

const NewUserNotification = z.object({
  _tag: z.literal("NewUser"),
  value: User,
});

const QueuePostBody = z.union([NewUserNotification]);

type User = z.infer<typeof User>;

class SuccessfullyQueueResponse {
  readonly _tag = "SuccessfullyQueuedAlt";
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

// We don't actually have a TimeoutError in this example, but
// we can imagine that the queue service could time out.
// class TimeoutError {
//   readonly _tag = "TimeoutError";
// }

const app = new Hono();

app.post("/queue", async (c) => {
  const body = await c.req.json();
  const queueBodyResult = QueuePostBody.safeParse(body);
  if (!queueBodyResult.success) {
    c.status(400);
    return c.json(new ValidationError(queueBodyResult.error));
  }

  return c.json(new SuccessfullyQueueResponse());
});

serve({
  fetch: app.fetch,
  port: 3003,
});
