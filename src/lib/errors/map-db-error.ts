import { PUBLIC_GENERIC_ERROR } from "@/lib/errors/public-messages";

export type DbErrorKind =
  | "duplicate"
  | "not_found"
  | "validation"
  | "permission"
  | "provider";

export function mapDbError(error: {
  message?: string;
  code?: string;
}): { message: string; kind: DbErrorKind } {
  const code = error.code ?? "";

  if (code === "23505") {
    return { message: "This record already exists.", kind: "duplicate" };
  }

  if (code === "42501" || code === "PGRST301") {
    return { message: "You do not have permission to do that.", kind: "permission" };
  }

  if (code === "P0001") {
    return { message: "That action is not allowed.", kind: "validation" };
  }

  return { message: PUBLIC_GENERIC_ERROR, kind: "provider" };
}

export function logDbError(context: string, error: unknown): void {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    typeof (error as { code: unknown }).code === "string"
      ? (error as { code: string }).code
      : "unknown";
  console.error(`[${context}] db_code=${code}`);
}
