import {
  createApp,
  createRootRoute,
  createRoute,
  Outlet,
  Link,
  useQueryClient,
  createEvQueryProxy,
  createEvMutationProxy,
} from "@evjs/runtime/client";
import { getUsers, createUser } from "./api/users.server";

// ── Root Route ──

function Root() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "1rem" }}>
      <h1>Server Functions Example</h1>
      <nav style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <Link to="/">Users</Link>
      </nav>
      <Outlet />
    </div>
  );
}

const rootRoute = createRootRoute({ component: Root });

// ── API Proxy ──
import * as UsersAPI from "./api/users.server";
const api = {
  query: createEvQueryProxy(UsersAPI),
  mutation: createEvMutationProxy(UsersAPI),
};

// ── Users Route ──

function UsersPage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");

  const { data: users = [], isLoading } = api.query.getUsers.useQuery([]);

  const queryClient = useQueryClient();
  const { mutateAsync: createMutation } = api.mutation.createUser.useMutation({
    onSuccess: () => {
      // Use the stable evId for cache invalidation
      queryClient.invalidateQueries({ queryKey: [api.query.getUsers.evId] });
    },
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email) return;
    await createMutation({ name, email });
    setName("");
    setEmail("");
  }

  if (isLoading) return <p>Loading users from server…</p>;

  return (
    <div>
      <h2>Users (fetched via friendly useServerQuery)</h2>
      <ul>
        {users.map((u: any) => (
          <li key={u.id}>
            {u.name} — {u.email}
          </li>
        ))}
      </ul>

      <h3>Add User</h3>
      <form onSubmit={handleCreate} style={{ display: "flex", gap: "0.5rem" }}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

const usersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: UsersPage,
});

// ── Mount ──

import * as React from "react";

const routeTree = rootRoute.addChildren([usersRoute]);

createApp({ routeTree }).render("#app");
