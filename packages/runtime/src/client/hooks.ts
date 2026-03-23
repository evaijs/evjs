/**
 * Smart wrappers around TanStack Query hooks that accept server functions directly.
 *
 * These wrappers detect whether the first argument is a function (server function
 * or raw async function) and automatically generate queryKey / queryFn / mutationFn.
 * Standard TanStack options objects are passed through unchanged.
 *
 * @example
 * // Server function — auto-generated key from build-time fnId
 * const { data } = useQuery(getUsers);
 * const { data } = useQuery(getUser, userId);
 *
 * // Standard TanStack options — passthrough
 * const { data } = useQuery({ queryKey: ["custom"], queryFn: fetchSomething });
 */

import type {
  UseMutationOptions,
  UseMutationResult,
  UseQueryOptions,
  UseQueryResult,
  UseSuspenseQueryOptions,
  UseSuspenseQueryResult,
} from "@tanstack/react-query";
import {
  useMutation as tanstackUseMutation,
  useQuery as tanstackUseQuery,
  useSuspenseQuery as tanstackUseSuspenseQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { __fn_call, getFnId } from "./transport";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Derive a stable base key for a function. */
export function getBaseKey(fn: (...args: unknown[]) => unknown): string {
  return getFnId(fn) || fn.name || "query";
}

/** Build the queryFn – uses RPC transport for server fns, direct call for raw fns. */
export function buildQueryFn(
  fn: (...args: unknown[]) => unknown,
  args: unknown[],
): (ctx: { signal: AbortSignal }) => Promise<unknown> {
  const fnId = getFnId(fn);
  if (fnId) {
    return ({ signal }) => __fn_call(fnId, args, { signal });
  }
  return () => fn(...args) as Promise<unknown>;
}

// ---------------------------------------------------------------------------
// useQuery
// ---------------------------------------------------------------------------

/**
 * Smart `useQuery` that accepts either a server function or standard TanStack options.
 *
 * @example
 * useQuery(getUsers);
 * useQuery(getUser, userId);
 * useQuery({ queryKey: ["x"], queryFn: fetchX });
 */
export function useQuery<TData = unknown, TError = Error>(
  fnOrOptions:
    | ((...args: unknown[]) => Promise<TData>)
    | UseQueryOptions<TData, TError>,
  ...args: unknown[]
): UseQueryResult<TData, TError> {
  if (typeof fnOrOptions === "function") {
    const baseKey = getBaseKey(fnOrOptions);
    return tanstackUseQuery<TData, TError>({
      queryKey: [baseKey, ...args],
      queryFn: buildQueryFn(fnOrOptions, args) as () => Promise<TData>,
    });
  }
  return tanstackUseQuery<TData, TError>(fnOrOptions);
}

/**
 * Smart `useSuspenseQuery` that accepts either a server function or standard options.
 */
export function useSuspenseQuery<TData = unknown, TError = Error>(
  fnOrOptions:
    | ((...args: unknown[]) => Promise<TData>)
    | UseSuspenseQueryOptions<TData, TError>,
  ...args: unknown[]
): UseSuspenseQueryResult<TData, TError> {
  if (typeof fnOrOptions === "function") {
    const baseKey = getBaseKey(fnOrOptions);
    return tanstackUseSuspenseQuery<TData, TError>({
      queryKey: [baseKey, ...args],
      queryFn: buildQueryFn(fnOrOptions, args) as () => Promise<TData>,
    });
  }
  return tanstackUseSuspenseQuery<TData, TError>(fnOrOptions);
}

// ---------------------------------------------------------------------------
// useMutation
// ---------------------------------------------------------------------------

/**
 * Smart `useMutation` that accepts either a server function or standard options.
 *
 * @example
 * const { mutate } = useMutation(createUser);
 * const { mutate } = useMutation(createUser, { onSuccess: () => ... });
 * const { mutate } = useMutation({ mutationFn: createUser });
 */
export function useMutation<
  TData = unknown,
  TError = Error,
  TVariables = unknown,
>(
  fnOrOptions:
    | ((...args: unknown[]) => Promise<TData>)
    | UseMutationOptions<TData, TError, TVariables>,
  options?: Omit<
    UseMutationOptions<TData, TError, TVariables>,
    "mutationFn"
  > & {
    /** Server functions whose queries should be invalidated on success. */
    invalidates?: ((...args: unknown[]) => unknown)[];
  },
): UseMutationResult<TData, TError, TVariables> {
  // Always call hooks unconditionally (React rules of hooks)
  const queryClient = useQueryClient();

  if (typeof fnOrOptions === "function") {
    const fn = fnOrOptions;
    const { invalidates, ...restOptions } = options ?? {};
    return tanstackUseMutation<TData, TError, TVariables>({
      ...(restOptions as Omit<
        UseMutationOptions<TData, TError, TVariables>,
        "mutationFn"
      >),
      mutationFn: (variables: TVariables) => fn(variables) as Promise<TData>,
      onSuccess: (...onSuccessArgs) => {
        if (invalidates) {
          for (const target of invalidates) {
            const targetKey = getBaseKey(target);
            queryClient.invalidateQueries({ queryKey: [targetKey] });
          }
        }
        (
          restOptions as UseMutationOptions<TData, TError, TVariables>
        )?.onSuccess?.(...onSuccessArgs);
      },
    });
  }
  return tanstackUseMutation<TData, TError, TVariables>(fnOrOptions);
}
