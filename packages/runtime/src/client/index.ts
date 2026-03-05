/**
 * Client-side runtime utilities.
 */

export type { App, CreateAppOptions } from "./create-app";
export { createApp } from "./create-app";
export * from "./route";
export { __ev_rpc, configureRpc } from "./rpc";
export type { RpcOptions } from "./rpc";

// ── TanStack Query Integration ──
export * from "@tanstack/react-query";
export * from "./query";
