import { inDateRange, matchesSearch, paginate, trips } from "@/data/store";
import { toQuery } from "@/lib/query";
import { apiRequest, mockLatency, useLiveApi } from "@/services/api";
import type { Paginated, QueryParams, Trip, TripStatus } from "@/types";

function filterTrips(params: QueryParams) {
  const status = params.filters?.status as TripStatus | undefined;
  const routeId = params.filters?.routeId;
  return trips.filter((row) => {
    const haystack = `${row.reference} ${row.passengerName} ${row.routeName} ${row.busNumber} ${row.conductorName}`;
    if (!matchesSearch(haystack, params.search)) return false;
    if (status && row.status !== status) return false;
    if (routeId && row.routeId !== routeId) return false;
    if (!inDateRange(row.createdAt, params.from, params.to)) return false;
    return true;
  });
}

export async function listTrips(params: QueryParams = {}): Promise<Paginated<Trip>> {
  if (useLiveApi()) return apiRequest(`/admin/trips${toQuery(params)}`);
  await mockLatency();
  return paginate(filterTrips(params), params);
}

export async function listStaffTrips(passengerId: string, params: QueryParams = {}): Promise<Paginated<Trip>> {
  if (useLiveApi()) return apiRequest(`/portal/trips${toQuery(params)}`);
  await mockLatency();
  const scoped = filterTrips(params).filter((row) => row.passengerId === passengerId);
  return paginate(scoped, params);
}
