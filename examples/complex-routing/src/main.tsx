import {
  createApp,
  createAppRootRoute,
  createRoute,
  Link,
  Outlet,
  redirect,
} from "@evjs/runtime/client";
import { query } from "@evjs/runtime/client";
import { getPost, getPosts, getStats, getUser } from "./api/data.server";

// ── Styles ──

const styles = {
  app: { fontFamily: "system-ui, sans-serif", maxWidth: 900, margin: "0 auto", padding: "1rem" },
  nav: { display: "flex", gap: "1rem", padding: "0.75rem 0", borderBottom: "1px solid #e5e7eb", marginBottom: "1rem" },
  link: { textDecoration: "none", color: "#6b7280" },
  sidebar: { display: "flex", gap: "1.5rem" },
  sidebarNav: { minWidth: 180, borderRight: "1px solid #e5e7eb", paddingRight: "1rem" },
  card: { border: "1px solid #e5e7eb", borderRadius: 8, padding: "1rem", marginBottom: "0.75rem" },
  tag: { display: "inline-block", background: "#f3f4f6", borderRadius: 4, padding: "2px 8px", fontSize: 12, marginRight: 4 },
  stat: { textAlign: "center" as const, padding: "1rem" },
} as const;

// ── Root Layout ──

function RootLayout() {
  return (
    <div style={styles.app}>
      <nav style={styles.nav}>
        <Link to="/" style={styles.link} activeProps={{ style: { color: "#111", fontWeight: 600 } }}>
          Home
        </Link>
        <Link to="/posts" style={styles.link} activeProps={{ style: { color: "#111", fontWeight: 600 } }}>
          Posts
        </Link>
        <Link to="/dashboard" style={styles.link} activeProps={{ style: { color: "#111", fontWeight: 600 } }}>
          Dashboard
        </Link>
        <Link to="/search" search={{ q: "" }} style={styles.link} activeProps={{ style: { color: "#111", fontWeight: 600 } }}>
          Search
        </Link>
      </nav>
      <Outlet />
    </div>
  );
}

const rootRoute = createAppRootRoute({ component: RootLayout });

// ── Home (static route) ──

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => (
    <div>
      <h1>evjs Complex Routing Example</h1>
      <p>Demonstrates nested layouts, dynamic params, search params, redirects, and server function loaders.</p>
      <ul>
        <li><Link to="/posts">Posts</Link> — nested group with dynamic <code>$postId</code></li>
        <li><Link to="/dashboard">Dashboard</Link> — pathless layout with server function loader</li>
        <li><Link to="/search" search={{ q: "tutorial" }}>Search</Link> — search params</li>
        <li><Link to="/old-blog">Old Blog</Link> — redirect to /posts</li>
      </ul>
    </div>
  ),
});

// ── Posts (nested group with layout + dynamic param) ──

function PostsLayout() {
  const { data: posts } = query(getPosts).useQuery([]);
  return (
    <div style={styles.sidebar}>
      <div style={styles.sidebarNav}>
        <h3 style={{ marginTop: 0 }}>Posts</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {posts?.map((p) => (
            <li key={p.id} style={{ marginBottom: "0.25rem" }}>
              <Link
                to="/posts/$postId"
                params={{ postId: p.id }}
                style={{ textDecoration: "none", color: "#374151" }}
                activeProps={{ style: { fontWeight: "bold", color: "#111" } }}
              >
                {p.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div style={{ flex: 1 }}>
        <Outlet />
      </div>
    </div>
  );
}

const postsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/posts",
  component: PostsLayout,
});

// Posts index (shown at /posts)
const postsIndexRoute = createRoute({
  getParentRoute: () => postsRoute,
  path: "/",
  component: () => <p style={{ color: "#6b7280" }}>← Select a post from the sidebar</p>,
});

// Post detail (dynamic slug: /posts/$postId)
const postDetailRoute = createRoute({
  getParentRoute: () => postsRoute,
  path: "$postId",
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(query(getPost).queryOptions([params.postId])),
  component: PostDetail,
});

function PostDetail() {
  const { postId } = postDetailRoute.useParams();
  const { data: post } = query(getPost).useQuery([postId]);

  if (!post) return <p>Loading...</p>;
  return (
    <div>
      <h2>{post.title}</h2>
      <p style={{ color: "#6b7280" }}>
        by <Link to="/users/$username" params={{ username: post.author }}>{post.author}</Link>
      </p>
      <p>{post.body}</p>
      <div>
        {post.tags.map((tag) => (
          <span key={tag} style={styles.tag}>{tag}</span>
        ))}
      </div>
    </div>
  );
}

// ── User profile (dynamic slug: /users/$username) ──

const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/users/$username",
  loader: ({ params, context }) =>
    context.queryClient.ensureQueryData(query(getUser).queryOptions([params.username])),
  component: UserProfile,
});

function UserProfile() {
  const { username } = userRoute.useParams();
  const { data: user } = query(getUser).useQuery([username]);

  if (!user) return <p>Loading...</p>;
  return (
    <div style={styles.card}>
      <h2>{user.name}</h2>
      <p style={{ color: "#6b7280" }}>@{user.username}</p>
      <p>{user.bio}</p>
      <Link to="/posts">← Back to posts</Link>
    </div>
  );
}

// ── Dashboard (pathless layout + server function loader) ──

const dashboardLayout = createRoute({
  getParentRoute: () => rootRoute,
  id: "dashboard-layout",
  component: () => (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <Link to="/dashboard" style={styles.link} activeProps={{ style: { color: "#111", fontWeight: 600 } }}>
          Overview
        </Link>
      </div>
      <Outlet />
    </div>
  ),
});

const dashboardRoute = createRoute({
  getParentRoute: () => dashboardLayout,
  path: "/dashboard",
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(query(getStats).queryOptions([])),
  component: Dashboard,
});

function Dashboard() {
  const { data: stats } = query(getStats).useQuery([]);
  if (!stats) return <p>Loading...</p>;
  return (
    <div>
      <h2>Dashboard</h2>
      <div style={{ display: "flex", gap: "1rem" }}>
        <div style={{ ...styles.card, ...styles.stat }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.totalPosts}</div>
          <div style={{ color: "#6b7280" }}>Posts</div>
        </div>
        <div style={{ ...styles.card, ...styles.stat }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.totalUsers}</div>
          <div style={{ color: "#6b7280" }}>Users</div>
        </div>
        <div style={{ ...styles.card, ...styles.stat }}>
          <div style={{ fontSize: 32, fontWeight: 700 }}>{stats.tags.length}</div>
          <div style={{ color: "#6b7280" }}>Tags</div>
        </div>
      </div>
      <h3>All Tags</h3>
      <div>{stats.tags.map((t) => <span key={t} style={styles.tag}>{t}</span>)}</div>
    </div>
  );
}

// ── Search (search params: /search?q=hello&page=1) ──

const searchRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/search",
  validateSearch: (search: Record<string, unknown>) => ({
    q: (search.q as string) || "",
  }),
  component: SearchPage,
});

function SearchPage() {
  const { q } = searchRoute.useSearch();
  const { data: results } = query(getPosts).useQuery([q || undefined]);

  return (
    <div>
      <h2>Search</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = new FormData(e.currentTarget);
          const q = form.get("q") as string;
          window.location.search = `?q=${encodeURIComponent(q)}`;
        }}
      >
        <input
          name="q"
          defaultValue={q}
          placeholder="Search posts..."
          style={{ padding: "0.5rem", width: 300, borderRadius: 4, border: "1px solid #d1d5db" }}
        />
      </form>
      <div style={{ marginTop: "1rem" }}>
        {q && <p style={{ color: "#6b7280" }}>Results for "{q}":</p>}
        {results?.map((post) => (
          <div key={post.id} style={styles.card}>
            <Link to="/posts/$postId" params={{ postId: post.id }} style={{ textDecoration: "none", color: "#111" }}>
              <strong>{post.title}</strong>
            </Link>
            <p style={{ margin: "0.25rem 0 0", color: "#6b7280", fontSize: 14 }}>{post.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Redirect: /old-blog → /posts ──

const redirectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/old-blog",
  beforeLoad: () => {
    throw redirect({ to: "/posts" });
  },
});

// ── 404 Catch-all ──

const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: () => (
    <div style={{ textAlign: "center", padding: "3rem" }}>
      <h1 style={{ fontSize: 48 }}>404</h1>
      <p style={{ color: "#6b7280" }}>Page not found</p>
      <Link to="/">← Go home</Link>
    </div>
  ),
});

// ── Route Tree ──

const routeTree = rootRoute.addChildren([
  homeRoute,
  postsRoute.addChildren([postsIndexRoute, postDetailRoute]),
  userRoute,
  dashboardLayout.addChildren([dashboardRoute]),
  searchRoute,
  redirectRoute,
  notFoundRoute,
]);

createApp({ routeTree }).render("#app");
