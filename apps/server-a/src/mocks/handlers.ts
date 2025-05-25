import { http, passthrough, HttpResponse } from "msw";

class QueueError {
  readonly _tag = "QueueError";
  readonly value: unknown;

  constructor(value: unknown) {
    this.value = value;
  }
}

export const handlers = [
  http.post("http://localhost:3001/notifications", ({ request }) => {
    switch (request.headers.get("X-Testing-ID")) {
      case "ValidationError":
        return HttpResponse.json(
          new QueueError({
            _tag: "ValidationError",
          }),
        );
      case "TimeoutError":
        return HttpResponse.json(
          new QueueError({
            _tag: "TimeoutError",
          }),
        );
      default:
        return passthrough();
    }
  }),
];
