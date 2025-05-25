import { Hono } from "hono";
import axios from "axios";
import { v4 } from "uuid";
import { ResultAsync } from "neverthrow";
import {
  InternalServerError,
  NewUserNotification,
  NoJsonBodyError,
  UnhandledResponseTagError,
  UserCreatedResponse,
  UsersPostBody,
  ValidationError,
} from "./helpers";

const app = new Hono();
app.post("/users", async (c) => {
  try {
    const body = await ResultAsync.fromPromise(c.req.json(), (err) => err);
    if (body.isErr()) {
      c.status(400);
      return c.json(new NoJsonBodyError());
    }

    const userBodyResult = UsersPostBody.safeParse(body.value);
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
      {
        headers: {
          "X-Tenancy-ID": c.req.header("X-Tenancy-ID"),
        },
      },
    );

    switch (res.data._tag) {
      case "ItemQueued":
        return c.json(new UserCreatedResponse(newUser));
      case "ItemQueuedNewVersionResponse":
        return c.json({
          _tag: "UserCreated",
          _message: "This uses the alternative tenant",
        });
      default:
        return c.json(new UnhandledResponseTagError());
    }
  } catch (err) {
    console.error("Something went wrong", err);
    return c.json(new InternalServerError());
  }
});

export { app };
