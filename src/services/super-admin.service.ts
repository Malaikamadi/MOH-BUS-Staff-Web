import { toQuery } from "@/lib/query";
import { apiRequest } from "@/services/api";
import type {
  AccountStatus,
  OperatorDraft,
  Paginated,
  QueryParams,
  SuperAdminDashboard,
  Transaction,
  User,
} from "@/types";

export async function getSuperAdminDashboard() {
  return apiRequest<SuperAdminDashboard>("/super-admin/dashboard");
}

export async function listOperators() {
  return apiRequest<User[]>("/super-admin/operators");
}

export async function createOperator(body: OperatorDraft) {
  return apiRequest<User>("/super-admin/operators", { method: "POST", body });
}

export async function setOperatorStatus(id: string, status: AccountStatus) {
  return apiRequest<User>(`/super-admin/operators/${id}/status`, { method: "PATCH", body: { status } });
}

export async function listHeadOfficeRecharges(params: QueryParams = {}) {
  return apiRequest<Paginated<Transaction>>(`/super-admin/recharges${toQuery(params)}`);
}
