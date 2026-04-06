import { createRoute } from "@evjs/client";
import { rootRoute } from "./__root";

function Home() {
  return (
    <div>
      <h1>Plugin Example</h1>
      <p>
        This example demonstrates the evjs plugin system. Check{" "}
        <code>ev.config.ts</code> to see how plugins work.
      </p>
      <p>
        View the page source to see the HTML comment injected by{" "}
        <code>transformHtml</code>.
      </p>
    </div>
  );
}

export const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Home,
});
