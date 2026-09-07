import { inDateRange, matchesSearch, paginate, transactions } from "@/data/store";
import { toQuery } from "@/lib/query";
import { apiRequest, mockLatency, useLiveApi } from "@/services/api";
import type { Paginated, QueryParams, Transaction, TransactionStatus, TransactionType } from "@/types";

function filterTransactions(params: QueryParams) {
  const type = params.filters?.type as TransactionType | undefined;
  const status = params.filters?.status as TransactionStatus | undefined;
  return transactions.filter((row) => {
    const haystack = `${row.reference} ${row.passengerName} ${row.description} ${row.id}`;
    if (!matchesSearch(haystack, params.search)) return false;
    if (type && row.type !== type) return false;
    if (status && row.status !== status) return false;
    if (!inDateRange(row.createdAt, params.from, params.to)) return false;
    return true;
  });
}

export async function listTransactions(params: QueryParams = {}): Promise<Paginated<Transaction>> {
  if (useLiveApi()) return apiRequest(`/admin/transactions${toQuery(params)}`);
  await mockLatency();
  return paginate(filterTransactions(params), params);
}

export async function listStaffTransactions(
  passengerId: string,
  params: QueryParams = {},
): Promise<Paginated<Transaction>> {
  if (useLiveApi()) return apiRequest(`/portal/transactions${toQuery(params)}`);
  await mockLatency();
  const scoped = filterTransactions(params).filter((row) => row.passengerId === passengerId);
  return paginate(scoped, params);
}

export async function getTransaction(id: string): Promise<Transaction> {
  if (useLiveApi()) return apiRequest(`/admin/transactions/${id}`);
  await mockLatency();
  const txn = transactions.find((row) => row.id === id);
  if (!txn) throw new Error("Transaction not found.");
  return txn;
}
