import { Role } from "@/lib/types";

export type Permission =
  | "dashboard:view"
  | "customers:manage"
  | "vehicles:manage"
  | "services:manage"
  | "orders:create"
  | "orders:update"
  | "orders:delete"
  | "invoices:manage"
  | "reports:view"
  | "reports:export"
  | "workers:manage"
  | "settings:manage";

const allPermissions: Permission[] = [
  "dashboard:view",
  "customers:manage",
  "vehicles:manage",
  "services:manage",
  "orders:create",
  "orders:update",
  "orders:delete",
  "invoices:manage",
  "reports:view",
  "reports:export",
  "workers:manage",
  "settings:manage"
];

const rolePermissions: Record<Role, Permission[]> = {
  manager: allPermissions,
  worker: []
};

export function can(role: Role, permission: Permission) {
  return rolePermissions[role]?.includes(permission) ?? false;
}
