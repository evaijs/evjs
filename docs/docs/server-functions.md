# Server Functions

Server functions let you call server-side logic from the browser as normal async functions — no manual API routes, no fetch boilerplate.

## How It Works

1. Create a file with `"use server";` at the top
2. Export named async functions
3. Import and call them from client code — evjs handles the rest

```ts
// src/api/users.server.ts
"use server";

export async function getUsers() {
  const db = await connectDB();
  return db.query("SELECT * FROM users");
}

export async function createUser(name: string, email: string) {
  const db = await connectDB();
  return db.insert("users", { name, email });
}
```

## Client Usage

### With TanStack Query

```tsx
import { query, mutation } from "@evjs/client";
import { getUsers, createUser } from "./api/users.server";

// Query wrapper — auto-generates queryKey + queryFn
const usersQuery = query(getUsers);
const createUserMutation = mutation(createUser);

function UserList() {
  const { data: users } = usersQuery.useQuery();
  const { mutate } = createUserMutation.useMutation();

  return (
    <div>
      <ul>
        {users?.map((u) => <li key={u.id}>{u.name}</li>)}
      </ul>
      <button onClick={() => mutate("Alice", "alice@example.com")}>
        Add User
      </button>
    </div>
  );
}
```

### Direct Call

```ts
import { getUsers } from "./api/users.server";

// Works just like a normal async function call
const users = await getUsers();
```

## Build Pipeline

At build time, the `"use server"` directive triggers two separate transforms:

- **Client build**: function bodies are replaced with `__fn_call(fnId, args)` stubs
- **Server build**: original bodies are preserved + `registerServerFn(fnId, fn)` is injected

Function IDs are stable SHA-256 hashes derived from file path + export name.

## Transport

By default, server functions use HTTP POST to `/api/fn`. You can customize the transport:

```ts
import { defineConfig } from "@evjs/cli";

export default defineConfig({
  server: {
    functions: {
      endpoint: "/api/fn", // default
    },
  },
});
```

The `ServerTransport` interface supports custom protocols (e.g., WebSocket, MessagePack).
