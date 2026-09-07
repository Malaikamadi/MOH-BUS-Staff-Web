/** Transport-level contracts shared by every service. */

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export type SortDirection = "asc" | "desc";

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortDir?: SortDirection;
  /** Inclusive ISO date (yyyy-mm-dd) lower bound. */
  from?: string;
  /** Inclusive ISO date (yyyy-mm-dd) upper bound. */
  to?: string;
  /** Arbitrary equality filters, e.g. `{ status: "active" }`. */
  filters?: Record<string, string | undefined>;
}

/** Normalised error shape produced by the API client for all failures. */
export interface ApiErrorPayload {
  message: string;
  status: number;
  code?: string;
  /** Field-level validation messages keyed by field name. */
  fieldErrors?: Record<string, string>;
}

export interface MutationResult {
  success: boolean;
  message: string;
}
