/** Shared app-wide TypeScript types. */

export type AppStatus = "idle" | "loading" | "error" | "success";

export type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  JobStatus,
  ApplicationStatus,
  AdminRole,
} from "./database";
