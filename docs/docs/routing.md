# Routing

evjs uses [TanStack Router](https://tanstack.com/router) for type-safe, code-based routing with full TypeScript inference.

## Defining Routes

```tsx
import {
  createAppRootRoute,
  createRoute,
  Outlet,
  Link,
} from "@evjs/client";

// Root layout
const rootRoute = createAppRootRoute({
  component: () => (
    <div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <Outlet />
    </div>
  ),
});

// Pages
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <h1>Home</h1>,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: () => <h1>About</h1>,
});

// Route tree
export const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);
```

## Nested Layouts

Routes can be nested to create shared layouts:

```tsx
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/dashboard",
  component: () => (
    <div className="dashboard-layout">
      <aside>Sidebar</aside>
      <main><Outlet /></main>
    </div>
  ),
});

const dashboardHome = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/",
  component: () => <h2>Dashboard Home</h2>,
});

const dashboardSettings = createRoute({
  getParentRoute: () => dashboardRoute,
  path: "/settings",
  component: () => <h2>Settings</h2>,
});
```

## Data Loading

Use TanStack Query within route loaders for data fetching:

```tsx
import { query } from "@evjs/client";
import { getUsers } from "./api/users.server";

const usersQuery = query(getUsers);

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users",
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData(usersQuery.queryOptions()),
  component: UsersPage,
});
```

## Dynamic Routes

```tsx
const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users/$userId",
  component: () => {
    const { userId } = userRoute.useParams();
    return <h1>User {userId}</h1>;
  },
});
```

## Route Handlers (REST API)

For public API endpoints, use route handlers:

```ts
// src/api/health.ts
import { route } from "@evjs/server";

export default route({
  GET: () => new Response("OK"),
});
```
