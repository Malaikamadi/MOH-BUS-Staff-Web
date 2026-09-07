import { toQuery } from "@/lib/query";
import { apiRequest } from "@/services/api";
import type {
  OfficeDashboard,
  OfficeRechargeRequest,
  OfficeStaffMatch,
  Paginated,
  QueryParams,
  RechargeResult,
  Transaction,
} from "@/types";

export async function getOfficeDashboard() {
  return apiRequest<OfficeDashboard>("/office/dashboard");
}

export async function searchOfficeStaff(query: string) {
  const q = encodeURIComponent(query.trim());
  return apiRequest<OfficeStaffMatch[]>(`/office/staff?q=${q}`);
}

export async function processOfficeRecharge(body: OfficeRechargeRequest) {
  return apiRequest<RechargeResult>("/office/recharge", { method: "POST", body });
}

export async function listOfficeHistory(params: QueryParams = {}) {
  return apiRequest<Paginated<Transaction>>(`/office/history${toQuery(params)}`);
}
