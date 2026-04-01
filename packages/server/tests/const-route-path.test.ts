import { expect, test } from "vitest";
import { route } from "../src/index";

test("route() rejects broad string type at compile time", () => {
  // Real enforcement is via @ts-expect-error below — tsc --noEmit validates it.
  // This test ensures the file is a valid vitest suite.
  expect(typeof route).toBe("function");
});

// ✅ Success: string literal path should compile
export const literalHandler = route("/api/users", {
  GET: async () => Response.json({}),
});

// Test: Should fail if path is broad string
const path: string = "/dynamic";
export const dynamicHandler = route(
  // @ts-expect-error — broad `string` type is not allowed, must be a string literal
  path,
  { GET: async () => Response.json({}) },
);
