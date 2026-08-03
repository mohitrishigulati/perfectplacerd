import "server-only";

/** Logs server-side failures without leaking details to the client. */
export function logServerError(context: string, error: unknown): void {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : String(error);
  const stack = error instanceof Error ? error.stack : undefined;
  console.error(`[${context}]`, message, stack ?? "");
}
