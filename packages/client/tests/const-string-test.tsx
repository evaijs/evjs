import { createAppRootRoute, createRoute } from "../src/index";

const rootRoute = createAppRootRoute({
  component: () => null,
});

// ✅ Success: string literal path should compile
const literalRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  component: () => null,
});

// Test: Should fail if path is broad string
const path: string = "/dynamic";
const dynamicRoute = createRoute({
  getParentRoute: () => rootRoute,
  // @ts-expect-error — broad `string` type is not allowed, must be a string literal
  path: path,
  component: () => null,
});
