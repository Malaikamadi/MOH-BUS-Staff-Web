import {
  accounts,
  getPassengerDetail,
  inDateRange,
  matchesSearch,
  paginate,
  passengers,
} from "@/data/store";
import { toQuery } from "@/lib/query";
import { apiRequest, mockLatency, useLiveApi } from "@/services/api";
import type { AccountStatus, Paginated, Passenger, PassengerDetail, QueryParams } from "@/types";

export async function listPassengers(params: QueryParams = {}): Promise<Paginated<Passenger>> {
  if (useLiveApi()) return apiRequest(`/admin/passengers${toQuery(params)}`);

  await mockLatency();
  const status = params.filters?.status as AccountStatus | undefined;
  const facility = params.filters?.facility;
  const filtered = passengers.filter((row) => {
    const haystack = `${row.name} ${row.email} ${row.staffNumber} ${row.facility} ${row.phone}`;
    if (!matchesSearch(haystack, params.search)) return false;
    if (status && row.status !== status) return false;
    if (facility && row.facility !== facility) return false;
    if (!inDateRange(row.createdAt, params.from, params.to)) return false;
    return true;
  });
  return paginate(filtered, params);
}

export async function getPassenger(id: string): Promise<PassengerDetail> {
  if (useLiveApi()) return apiRequest(`/admin/passengers/${id}`);
  await mockLatency();
  const detail = getPassengerDetail(id);
  if (!detail) throw new Error("Staff account not found.");
  return detail;
}

export async function setPassengerStatus(id: string, status: AccountStatus) {
  if (useLiveApi()) {
    return apiRequest(`/admin/passengers/${id}/status`, { method: "PATCH", body: { status } });
  }
  await mockLatency();
  const passenger = passengers.find((row) => row.id === id);
  const account = accounts.find((row) => row.passengerId === id);
  if (!passenger) throw new Error("Staff account not found.");
  passenger.status = status;
  if (account) account.status = status === "suspended" ? "suspended" : account.status;
  return { success: true, message: `Account ${status}.` };
}

export async function getCurrentStaffProfile(email?: string) {
  if (useLiveApi()) return apiRequest<PassengerDetail>("/portal/me");
  await mockLatency();
  const match = email
    ? passengers.find((row) => row.email.toLowerCase() === email.toLowerCase())
    : undefined;
  const detail = getPassengerDetail(match?.id ?? "psg_001");
  if (!detail) throw new Error("Staff profile not found.");
  return detail;
}
