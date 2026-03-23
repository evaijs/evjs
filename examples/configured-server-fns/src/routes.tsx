import {
  createAppRootRoute,
  createRoute,
  Link,
  Outlet,
  useMutation,
  useQuery,
} from "@evjs/runtime/client";
import { useState } from "react";
import { createUser, getUsers } from "./api/users.server";

// ── Root Route ──

function Root() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "1rem" }}>
      <h1>Configured Server Functions</h1>
      <p style={{ color: "#666" }}>
        This example uses <code>ev.config.ts</code> for custom ports and
        settings.
      </p>
      <nav style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <Link to="/">Users</Link>
      </nav>
      <Outlet />
    </div>
  );
}

const rootRoute = createAppRootRoute({ component: Root });

// ── Users Route ──

function UsersPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const { data: users = [], isLoading } =
    useQuery<{ id: string; name: string; email: string }[]>(getUsers);

  const { mutateAsync: doCreateUser } = useMutation(createUser, {
    invalidates: [getUsers],
  });

  async function handleCreate(e: { preventDefault: () => void }) {
    e.preventDefault();
    if (!name || !email) return;
    await doCreateUser({ name, email });
    setName("");
    setEmail("");
  }

  if (isLoading) return <p>Loading users from server…</p>;

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((u: { id: string; name: string; email: string }) => (
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

// ── Route Tree ──

export const routeTree = rootRoute.addChildren([usersRoute]);
