import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildQueryFn, getBaseKey } from "../src/client/hooks.js";
import {
  __fn_register,
  __resetForTesting,
  initTransport,
} from "../src/client/transport.js";

// We test the underlying helpers directly since the React hooks
// (useQuery, useMutation) require a React + QueryClientProvider context.

describe("getBaseKey", () => {
  beforeEach(() => {
    __resetForTesting();
  });

  it("returns fnId for registered server functions", () => {
    const fn = async () => [];
    __fn_register(fn, "mod:getUsers", "getUsers");

    expect(getBaseKey(fn)).toBe("mod:getUsers");
  });

  it("falls back to fn.name for unregistered named functions", () => {
    async function fetchGithubUser() {
      return {};
    }
    expect(getBaseKey(fetchGithubUser)).toBe("fetchGithubUser");
  });

  it("falls back to 'query' for anonymous functions", () => {
    const fn = async () => {};
    // Assign empty name to simulate minified arrow function
    Object.defineProperty(fn, "name", { value: "" });
    expect(getBaseKey(fn)).toBe("query");
  });
});

describe("buildQueryFn", () => {
  beforeEach(() => {
    __resetForTesting();
  });

  it("uses __fn_call for registered server functions", async () => {
    const send = vi.fn().mockResolvedValue([{ id: 1 }]);
    initTransport({ transport: { send } });

    const fn = async () => [];
    __fn_register(fn, "mod:getUsers", "getUsers");

    const queryFn = buildQueryFn(fn, []);
    const result = await queryFn({
      signal: undefined as unknown as AbortSignal,
    });

    expect(send).toHaveBeenCalledWith("mod:getUsers", [], {
      signal: undefined,
    });
    expect(result).toEqual([{ id: 1 }]);
  });

  it("calls raw function directly for unregistered functions", async () => {
    const rawFn = vi.fn().mockResolvedValue({ name: "evaijs" });

    const queryFn = buildQueryFn(rawFn, ["evaijs"]);
    const result = await queryFn({
      signal: undefined as unknown as AbortSignal,
    });

    expect(rawFn).toHaveBeenCalledWith("evaijs");
    expect(result).toEqual({ name: "evaijs" });
  });

  it("passes multiple args to raw function", async () => {
    const rawFn = vi.fn().mockResolvedValue("ok");

    const queryFn = buildQueryFn(rawFn, ["a", "b", "c"]);
    await queryFn({ signal: undefined as unknown as AbortSignal });

    expect(rawFn).toHaveBeenCalledWith("a", "b", "c");
  });
});
