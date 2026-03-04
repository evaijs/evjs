import { createRoute } from "@evai/shell/client";
import { rootRoute } from "./__root";

function Home() {
  return (
    <div>
      <h1>Welcome Home!</h1>
      <p>
        A basic client-side rendered app built with <code>@evai/shell</code>.
      </p>
    </div>
  );
}

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});
