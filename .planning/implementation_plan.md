# Template Symlinking & CLI Refactor

Simplify template maintenance by using directory-level symlinks to examples and enhancing the CLI to handle versioning and filtering.

## User Review Required

> [!IMPORTANT]
> The `ev init` command will now perform post-processing on the generated `package.json` to ensure `@evjs/*` dependencies match the CLI version, as templates will now share `package.json` with examples (which use `*`).

## Proposed Changes

### [CLI]
#### [MODIFY] [index.ts](file:///Users/xusd320/Codes/github/evai/packages/cli/src/index.ts)
- Update `init` action to include a filter in `fs.copy` (skip `node_modules`, `dist`, `.turbo`).
- Add logic to read `VERSION` and update `@evjs/*` dependency versions in the destination `package.json` after copying.

### [Templates]
#### [DELETE] [basic-server-fns](file:///Users/xusd320/Codes/github/evai/packages/cli/templates/basic-server-fns) (Individual symlinks/files)
#### [NEW] [basic-server-fns](file:///Users/xusd320/Codes/github/evai/packages/cli/templates/basic-server-fns) (Symlink to example)
#### [DELETE] [basic-csr](file:///Users/xusd320/Codes/github/evai/packages/cli/templates/basic-csr) (Individual symlinks/files)
#### [NEW] [basic-csr](file:///Users/xusd320/Codes/github/evai/packages/cli/templates/basic-csr) (Symlink to example)

## Verification Plan

### Manual Verification
1. Run `ev init test-app -t basic-server-fns`.
2. Verify `test-app/` does not contain `node_modules` or `dist`.
3. Verify `test-app/package.json` has versioned dependencies (e.g., `^0.0.1-alpha.5`) instead of `*`.
2.  **Add a server file**: Create `src/api/test.server.ts` with a `"use server"` export.
3.  **Verify Child Compiler**: Ensure Webpack detects the new file and builds the server bundle.
4.  **Verify Server Boot**: Ensure the Node API server starts automatically.
5.  **Remove the file**: Verify the server entry is updated and the build remains consistent.
