import axios, { isAxiosError } from "axios";
import { ResultAsync } from "neverthrow";
import { describe, expect, it } from "vitest";

/**
 * These tests expect all the servers to be up and running.
 */
describe("app", () => {
  describe("creating a user", () => {
    describe("success states", () => {
      it("successfully creates a user", async () => {
        const response = await axios.post(
          "http://localhost:3000/users",
          {
            name: "Dennis",
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        expect(response.status).toBe(200);
        expect(response.data._tag).toBe("UserCreated");
      });

      it("successfully creates a user taking the alternative path", async () => {
        // This test will run against Downstream C Prime thanks
        // to the X-Tenancy-ID
        const response = await axios.post(
          "http://localhost:3000/users",
          {
            name: "Dennis",
          },
          {
            headers: {
              "Content-Type": "application/json",
              "X-Tenancy-ID": "Feature/QueueUpdate",
            },
          },
        );

        expect(response.status).toBe(200);
        expect(response.data._tag).toBe("UserCreated");
        expect(response.data._message).toBe("This uses the alternative tenant");
      });
    });

    describe("error states", () => {
      it("requires a name property within the json body", async () => {
        const response = await ResultAsync.fromPromise(
          axios.post(
            "http://localhost:3000/users",
            {},
            {
              headers: {
                "Content-Type": "application/json",
              },
            },
          ),
          (err) => err,
        );

        // There is likely a better way to handle this, but will
        // leave it in as it's the assertions that I care most
        // about using for illustration purposes.
        if (
          !response.isErr() ||
          !isAxiosError(response.error) ||
          !response.error.response
        ) {
          throw new Error("Unexpected request success");
        }

        expect(response.error.response.status).toBe(400);
        expect(response.error.response.data._tag).toBe("ValidationError");
      });

      it("returns information on the queue service TimeoutError", async () => {
        const response = await ResultAsync.fromPromise(
          axios.post(
            "http://localhost:3000/users",
            {
              name: "Dennis",
            },
            {
              headers: {
                "Content-Type": "application/json",
                "X-Tenancy-ID": "DownstreamB/TimeoutError",
              },
            },
          ),
          (err) => err,
        );

        // There is likely a better way to handle this, but will
        // leave it in as it's the assertions that I care most
        // about using for illustration purposes.
        if (
          !response.isErr() ||
          !isAxiosError(response.error) ||
          !response.error.response
        ) {
          throw new Error("Unexpected request success");
        }

        expect(response.error.response.status).toBe(500);
        expect(response.error.response.data._tag).toBe("QueueError");
        expect(response.error.response.data.value._tag).toBe("TimeoutError");
      });

      it("returns information on the queue service ValidationError", async () => {
        const response = await ResultAsync.fromPromise(
          axios.post(
            "http://localhost:3000/users",
            {
              name: "Dennis",
            },
            {
              headers: {
                "Content-Type": "application/json",
                "X-Tenancy-ID": "DownstreamB/ValidationError",
              },
            },
          ),
          (err) => err,
        );

        // There is likely a better way to handle this, but will
        // leave it in as it's the assertions that I care most
        // about using for illustration purposes.
        if (
          !response.isErr() ||
          !isAxiosError(response.error) ||
          !response.error.response
        ) {
          throw new Error("Unexpected request success");
        }

        expect(response.error.response.status).toBe(500);
        expect(response.error.response.data._tag).toBe("QueueError");
        expect(response.error.response.data.value._tag).toBe("ValidationError");
      });
    });
  });
});
