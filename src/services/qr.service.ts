import { inDateRange, matchesSearch, newId, newToken, paginate, qrAccounts } from "@/data/store";
import { toQuery } from "@/lib/query";
import { apiRequest, mockLatency, useLiveApi } from "@/services/api";
import type { Paginated, QRAccount, QRStatus, QueryParams } from "@/types";

export async function listQrAccounts(params: QueryParams = {}): Promise<Paginated<QRAccount>> {
  if (useLiveApi()) return apiRequest(`/admin/qr-accounts${toQuery(params)}`);
  await mockLatency();
  const status = params.filters?.status as QRStatus | undefined;
  const filtered = qrAccounts.filter((row) => {
    const haystack = `${row.passengerName} ${row.secureToken} ${row.id}`;
    if (!matchesSearch(haystack, params.search)) return false;
    if (status && row.status !== status) return false;
    if (!inDateRange(row.createdAt, params.from, params.to)) return false;
    return true;
  });
  return paginate(filtered, params);
}

export async function setQrStatus(id: string, status: Exclude<QRStatus, "replaced">) {
  if (useLiveApi()) {
    return apiRequest(`/admin/qr-accounts/${id}/status`, { method: "PATCH", body: { status } });
  }
  await mockLatency();
  const qr = qrAccounts.find((row) => row.id === id);
  if (!qr) throw new Error("QR account not found.");
  qr.status = status;
  if (status === "disabled") qr.revokedAt = new Date().toISOString();
  return { success: true, message: status === "disabled" ? "QR disabled." : "QR reactivated." };
}

/**
 * Replace a compromised QR: invalidate the old token, issue a new one, keep
 * the same wallet and staff account.
 */
export async function replaceQr(id: string) {
  if (useLiveApi()) {
    return apiRequest<QRAccount>(`/admin/qr-accounts/${id}/replace`, { method: "POST" });
  }
  await mockLatency(400);
  const current = qrAccounts.find((row) => row.id === id);
  if (!current) throw new Error("QR account not found.");

  const replacement: QRAccount = {
    ...current,
    id: newId("qr"),
    secureToken: newToken(),
    status: "active",
    createdAt: new Date().toISOString(),
    revokedAt: undefined,
    replacedByQrId: undefined,
    scanCount: 0,
    lastScannedAt: undefined,
  };

  current.status = "replaced";
  current.revokedAt = replacement.createdAt;
  current.replacedByQrId = replacement.id;
  qrAccounts.unshift(replacement);
  return replacement;
}

export async function getStaffQr() {
  if (useLiveApi()) return apiRequest<QRAccount>("/portal/qr");
  await mockLatency();
  const qr = qrAccounts.find((row) => row.id === "qr_001");
  if (!qr) throw new Error("QR account not found.");
  return qr;
}
