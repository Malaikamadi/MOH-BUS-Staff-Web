export function newId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export function newToken() {
  const bytes = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16));
  return `qrt_${bytes.join("")}`;
}

export function newReference(prefix: "TXN" | "TRP") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export function newSessionToken(kind: "usr" | "cnd", id: string) {
  return `${kind}.${id}.${Date.now()}.${Math.random().toString(36).slice(2, 12)}`;
}
