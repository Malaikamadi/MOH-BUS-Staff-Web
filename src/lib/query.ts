import { appConfig } from "@/config/app";
import type { Paginated, QueryParams } from "@/types";

export function toQuery(params: QueryParams = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.pageSize) search.set("pageSize", String(params.pageSize));
  if (params.search) search.set("search", params.search);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  if (params.sortBy) search.set("sortBy", params.sortBy);
  if (params.sortDir) search.set("sortDir", params.sortDir);
  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (value) search.set(`filter.${key}`, value);
    }
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

export function fromRequestUrl(url: string): QueryParams {
  const search = new URL(url).searchParams;
  const filters: Record<string, string> = {};
  for (const [key, value] of search.entries()) {
    if (key.startsWith("filter.") && value) filters[key.slice(7)] = value;
  }
  const page = Number(search.get("page") ?? 1);
  const pageSize = Number(search.get("pageSize") ?? appConfig.table.defaultPageSize);
  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : appConfig.table.defaultPageSize,
    search: search.get("search") ?? undefined,
    from: search.get("from") ?? undefined,
    to: search.get("to") ?? undefined,
    sortBy: search.get("sortBy") ?? undefined,
    sortDir: search.get("sortDir") === "asc" ? "asc" : search.get("sortDir") === "desc" ? "desc" : undefined,
    filters,
  };
}

export function pageWindow(params: QueryParams) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? appConfig.table.defaultPageSize;
  return { page, pageSize, skip: (page - 1) * pageSize, take: pageSize };
}

export function dateRange(params: QueryParams) {
  const createdAt: { gte?: Date; lte?: Date } = {};
  if (params.from) createdAt.gte = new Date(`${params.from}T00:00:00.000Z`);
  if (params.to) createdAt.lte = new Date(`${params.to}T23:59:59.999Z`);
  return Object.keys(createdAt).length ? createdAt : undefined;
}

export function paginated<T>(items: T[], total: number, params: QueryParams): Paginated<T> {
  const { page, pageSize } = pageWindow(params);
  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}
