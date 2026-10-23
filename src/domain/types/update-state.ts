export type UpdateState =
  | { state: "current" }
  | { state: "downloading" | "ready"; version: string }
  | { state: "unreachable" };
