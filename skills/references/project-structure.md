---
name: Project Structure Conventions
description: How to structure files and folders in an evjs full-stack project, focusing on separating pure frontend concepts from backend (api/server) code and splitting by business features.
---

# `evjs` Project Structure Conventions

When writing or refactoring `evjs` projects, follow these structural conventions. `evjs` projects use TanStack Router for file-based routing and a `"use server"` directive system for backend functions.

## 1. Top-Level Layout

An ideal full-stack structure for `evjs`:

```text
my-evjs-app/
├── ev.config.ts           # Build configuration
├── package.json
├── public/                # Static assets 
└── src/
    ├── app.tsx            # Global app mounting point
    ├── routes/            # (Core) URL routing definitions
    ├── api/               # (Core) Server logic, databases, server functions
    ├── components/        # Global, reusable UI components
    ├── features/          # (Recommended) Business domain modules
    ├── lib/               # Shared logic / libraries
    ├── hooks/             # Reusable custom React Hooks
    └── styles/            # Global CSS / Tailwind
```

## 2. Component & Slicing Strategy

### The `src/routes/` directory (The Glue Layer)
- Route components (`index.tsx`, `posts.$id.tsx`) should act as **glue code**.
- They map URLs to views and handle raw URL parameters/loaders.
- **Do not write massive business logic or 500-line components in route files.** Instead, import feature-specific components from `features/` or global components from `components/` and assemble them here.

### The `src/api/` directory (The Server Boundary)
- `evjs` finds `*.server.ts` files automatically via a glob, but for maintainability, all server-side logic must be kept inside `src/api/`.
- This enforces a clear physical boundary. Anything interacting with Node.js built-ins (`fs`, `crypto`), databases, or sensitive logic stays in `api/` and never accidentally imports into a client bundle.
- **Example files:** `src/api/users.server.ts`, `src/api/db.server.ts`.

### The `src/features/` directory (For Scalability)
- To prevent `components/` and `hooks/` from becoming dumping grounds, logically group related UI parts, hooks, and types by their domain name inside `features/`.
- **Example:**
  ```text
  src/features/auth/
  ├── components/LoginForm.tsx
  ├── components/UserProfile.tsx
  ├── hooks/useSession.ts
  └── types.ts
  ```
- **Rule of thumb:** If a component is ONLY used for Authentication, it goes in `features/auth/`. If a component is a primitive like `<Button>` used everywhere, it goes in `src/components/`.

## Summary Checklist for Coding Assistants
- [ ] Did you avoid putting complex, 500-line React views inside `routes/`?
- [ ] Is server-side logic strictly inside the `src/api/` folder?
- [ ] Are domains organized into `src/features/[featureName]/` to avoid cluttering root folders?
