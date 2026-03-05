import * as React from "react";
import {
  createApp,
  createRootRoute,
  createRoute,
  Outlet,
  Link,
} from "@evjs/runtime/client";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { trpcHandler, getServerTime } from "./api/trpc.server";
import type { AppRouter } from "./trpc";

// ── tRPC Glue ──

// Custom link that redirects tRPC calls to our @evjs Server Function
const serverFnLink = () => {
  return (props: any) => {
    return (next: any) => {
      return (op: any) => {
        return {
          subscribe(observer: any) {
            trpcHandler(op)
              .then((res) => {
                observer.next({ result: { data: res.result.data } });
                observer.complete();
              })
              .catch((err) => {
                observer.error(err);
              });
          },
        };
      };
    };
  };
};

const trpc = createTRPCClient<AppRouter>({
  links: [serverFnLink()],
});

// ── Root Route ──

function Root() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <header style={{ borderBottom: "1px solid #eee", marginBottom: "2rem", paddingBottom: "1rem" }}>
        <h1 style={{ margin: 0 }}>@evjs + tRPC</h1>
        <p style={{ color: "#666" }}>Combining Zero-Config Server Functions with tRPC Type-Safety</p>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}

const rootRoute = createRootRoute({ component: Root });

// ── Home Route ──

function HomePage() {
  const [trpcData, setTrpcData] = React.useState<any>(null);
  const [serverTime, setServerTime] = React.useState<string>("");

  const refreshAction = async () => {
    // 1. Call via tRPC (proxied through Server Function)
    const res = await trpc.hello.query();
    setTrpcData(res);

    // 2. Call direct Server Function
    const time = await getServerTime();
    setServerTime(time);
  };

  React.useEffect(() => {
    refreshAction();
  }, []);

  return (
    <div style={{ display: "grid", gap: "2rem" }}>
      <section style={{ background: "#f9f9f9", padding: "1.5rem", borderRadius: "8px" }}>
        <h3>1. tRPC Call</h3>
        <p>This call uses the tRPC client, but is actually transported via an <code>@evjs</code> Server Function.</p>
        <pre style={{ background: "#eee", padding: "1rem" }}>
          {trpcData ? JSON.stringify(trpcData, null, 2) : "Loading..."}
        </pre>
      </section>

      <section style={{ background: "#f0f7ff", padding: "1.5rem", borderRadius: "8px" }}>
        <h3>2. Direct Server Function</h3>
        <p>This is a standard <code>"use server"</code> call.</p>
        <p><strong>Server Time:</strong> {serverTime || "..."}</p>
      </section>

      <button 
        onClick={refreshAction}
        style={{ padding: "0.75rem 1.5rem", fontSize: "1rem", cursor: "pointer", borderRadius: "4px", border: "none", background: "#0070f3", color: "white" }}
      >
        Refresh All
      </button>
    </div>
  );
}

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

// ── Mount ──

const routeTree = rootRoute.addChildren([homeRoute]);
createApp({ routeTree }).render("#app");
