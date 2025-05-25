import { z } from "zod/v4";

export const UsersPostBody = z.object({
  name: z.string(),
});

export interface User {
  id: string;
  name: string;
}

export class InternalServerError {
  readonly _tag = "InternalServerError";
  readonly value = {
    message: "Internal Server Error",
  };
}

export class UnhandledResponseTagError {
  readonly _tag = "UnhandledResponseTag";
  readonly value = {
    message: "Internal Server Error",
  };
}

export class NoJsonBodyError {
  readonly _tag = "NoJsonBody";
  readonly value = {
    message: "Request body is required",
  };
}

export class ValidationError {
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

export class UserCreatedResponse {
  readonly _tag = "UserCreated";
  readonly value: User;

  constructor(newUser: User) {
    this.value = newUser;
  }
}

export class NewUserNotification {
  readonly _tag = "NewUser";
  readonly value: User;

  constructor(newUser: User) {
    this.value = newUser;
  }
}
