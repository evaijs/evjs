/**
 * Routing utilities re-exported from @tanstack/react-router.
 *
 * This module provides the core primitives for building file-based
 * or code-based routing in the ev framework.
 */

// Types
export type {
  AnyRootRoute,
  AnyRoute,
  AnyRouteMatch,
  AnyRouter,
  ErrorComponentProps,
  ErrorRouteComponent,
  LinkOptions,
  LinkProps,
  NavigateOptions,
  NotFoundError,
  NotFoundRouteComponent,
  NotFoundRouteProps,
  RegisteredRouter,
  RouteComponent,
  RouteMatch,
  RouterOptions,
  RouterState,
  SearchSchemaInput,
} from "@tanstack/react-router";

import {
  createRoute as _createRoute,
  type AnyContext,
  type AnyRoute,
  type ResolveFullPath,
  type ResolveId,
  type ResolveParams,
  type Route,
  type RouteOptions,
} from "@tanstack/react-router";

export {
  CatchBoundary,
  CatchNotFound,
  createLink,
  createRootRoute,
  createRootRouteWithContext,
  createRouteMask,
  createRouter,
  DefaultGlobalNotFound,
  ErrorComponent,
  getRouteApi,
  isNotFound,
  isRedirect,
  Link,
  lazyRouteComponent,
  linkOptions,
  Navigate,
  notFound,
  Outlet,
  RouterProvider,
  redirect,
  useBlocker,
  useCanGoBack,
  useLoaderData,
  useLoaderDeps,
  useLocation,
  useMatch,
  useMatchRoute,
  useNavigate,
  useParams,
  useRouteContext,
  useRouter,
  useRouterState,
  useSearch,
} from "@tanstack/react-router";

/**
 * Restricted version of createRoute that only accepts string literals for the 'path' property.
 * This ensures that routes are statically analyzable by the ev build system.
 */
export function createRoute<
  TRegister = unknown,
  TParentRoute extends AnyRoute = AnyRoute,
  const TPath extends string = string,
  TFullPath extends string = ResolveFullPath<TParentRoute, TPath>,
  TCustomId extends string = string,
  TId extends string = ResolveId<TParentRoute, TCustomId, TPath>,
  TSearchValidator = undefined,
  TParams = ResolveParams<TPath>,
  TRouteContextFn = AnyContext,
  TBeforeLoadFn = AnyContext,
  // biome-ignore lint/suspicious/noExplicitAny: TanStack Router's TLoaderDeps constraint requires `any`
  // biome-ignore lint/complexity/noBannedTypes: TanStack Router's default type requires `{}`
  TLoaderDeps extends Record<string, any> = {},
  TLoaderFn = undefined,
  TChildren = unknown,
  TSSR = unknown,
  const TServerMiddlewares = unknown,
>(
  options: RouteOptions<
    TRegister,
    TParentRoute,
    TId,
    TCustomId,
    TFullPath,
    string extends TPath ? never : TPath,
    TSearchValidator,
    TParams,
    TLoaderDeps,
    TLoaderFn,
    AnyContext,
    TRouteContextFn,
    TBeforeLoadFn,
    TSSR,
    TServerMiddlewares
  >,
): Route<
  TRegister,
  TParentRoute,
  TPath,
  TFullPath,
  TCustomId,
  TId,
  TSearchValidator,
  TParams,
  AnyContext,
  TRouteContextFn,
  TBeforeLoadFn,
  TLoaderDeps,
  TLoaderFn,
  TChildren,
  TSSR,
  TServerMiddlewares
> {
  // biome-ignore lint/suspicious/noExplicitAny: Bridge our restricted wrapper to upstream's broader type
  return _createRoute(options as any);
}
