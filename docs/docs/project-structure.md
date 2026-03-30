# Project Structure

When building applications with `evjs`, we recommend a modern, scalable full-stack directory structure inspired by Feature-Sliced Design. This convention separates frontend components from pure server boundaries and organizes code by business domains (features) rather than by technical roles as the project scales.

## Recommended Structure

```text
my-evjs-app/
├── ev.config.ts           # evjs framework configuration
├── package.json
├── tsconfig.json
├── public/                # Static assets (images, fonts, favicon, etc.)
└── src/
    ├── app.tsx            # Main application mounting point wrapper
    │
    ├── routes/            # (Core) TanStack Router file-based routing
    │   ├── __root.tsx     # Root layout wrapping all pages
    │   ├── index.tsx      # Entry page (matches `/`)
    │   └── posts.$id.tsx  # Matches `/posts/:id`
    │
    ├── api/               # (Core) Backend logic and server functions
    │   ├── *.server.ts    # Pure Server Functions (transformed to RPC by the build system)
    │   └── handlers/      # [Optional] Standard REST Route Handlers (e.g. for external Webhooks)
    │
    ├── components/        # Global, reusable, "dumb" UI components (Button, Modal, Layout, etc.)
    │
    ├── features/          # [Recommended] Business domain modules (great for medium/large apps)
    │   └── auth/          # E.g., The entire auth module
    │       ├── components/# UI components specifically built for authentication
    │       ├── hooks/     # Custom hooks used only within auth
    │       ├── utils.ts   # Logic specific to auth
    │       └── types.ts   # Domain type definitions
    │
    ├── lib/               # Shared libraries and wrappers (API clients, loggers, etc.)
    │
    ├── hooks/             # Globally reusable React Hooks
    │
    ├── styles/            # Global stylesheets (Tailwind imports, custom CSS variables)
    │
    └── root-types.ts      # (Optional) Global ambient type definitions
```

## Core Design Principles

### 1. The `src/routes/` Folder is for Assembly
We discourage writing massive amounts of business logic directly in the route component files. Instead, treat route files as "glue code"—they should import feature-specific components from the `features/` or `components/` folders and assemble them into a page. This significantly improves readability and testing.

### 2. The `src/api/` Folder is the Server Boundary
Because `evjs` transforms `*.server.ts` files automatically, placing them anywhere works. However, we strongly recommend isolating all database interactions, schema definitions, and server-side utilities within `src/api/`. This creates a clear boundary, ensuring server secrets or Node.js built-ins don't inadvertently leak into frontend components.

### 3. Slicing by `features/`
When single-page applications grow, flat `components/` and `hooks/` folders quickly turn into an unmaintainable "Big Ball of Mud". The `features/` pattern solves this by keeping highly coupled logic enclosed in its own domain bucket.
