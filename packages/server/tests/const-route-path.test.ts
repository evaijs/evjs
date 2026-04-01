import { route } from "../src/index";

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
