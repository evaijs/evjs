import { createRootRoute, Outlet } from "@evjs/client";

function Root() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "1rem" }}>
      <Outlet />
    </div>
  );
}

export const rootRoute = createRootRoute({
  component: Root,
});
