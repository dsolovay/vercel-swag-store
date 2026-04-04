
export const InitialServerActionState: ServerActionResponse = { state: "idle" };
// TODO Remove dedicated response types to be consistent.

export type ServerActionResponse = {
  state: "idle" | "success" | "error";
}; // Error details intntionally omitted so not transmitted to client.
