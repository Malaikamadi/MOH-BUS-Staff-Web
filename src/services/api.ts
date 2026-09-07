import { appConfig } from "@/config/app";
import type { ApiErrorPayload, AuthSession } from "@/types";

export class ApiError extends Error implements ApiErrorPayload {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;

  constructor(payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = payload.status;
    this.code = payload.code;
    this.fieldErrors = payload.fieldErrors;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
  /** Skip the timeout wrapper for long-running downloads. */
  timeoutMs?: number;
}

function clientToken() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(appConfig.session.storageKey);
    if (!raw) return null;
    return (JSON.parse(raw) as AuthSession).accessToken ?? null;
  } catch {
    return null;
  }
}

/**
 * Central HTTP client used by the web app. The Flutter conductor app talks to
 * the same `/api/v1` origin against the local Postgres database.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, timeoutMs = appConfig.api.timeoutMs, headers, ...init } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const bearer = token ?? clientToken();

  try {
    const response = await fetch(`${appConfig.api.baseUrl}${path}`, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    const data = text ? (JSON.parse(text) as unknown) : null;

    if (!response.ok) {
      const error = (data ?? {}) as Partial<ApiErrorPayload>;
      throw new ApiError({
        message: error.message ?? `Request failed with status ${response.status}`,
        status: response.status,
        code: error.code,
        fieldErrors: error.fieldErrors,
      });
    }

    return data as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError({ message: "The request timed out. Please try again.", status: 408 });
    }
    throw new ApiError({
      message: error instanceof Error ? error.message : "Unable to reach the ministry service.",
      status: 0,
    });
  } finally {
    clearTimeout(timer);
  }
}

export function useLiveApi() {
  return !appConfig.api.useMock;
}

/** Simulated latency so mock screens behave like a networked API. */
export function mockLatency(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
