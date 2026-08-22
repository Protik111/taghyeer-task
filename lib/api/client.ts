import { ApiError, type ApiErrorBody } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://frontend-task-chatapp.onrender.com/api";

let authToken: string | null = null;

/** Called by AuthContext whenever the session token changes, so every
 * request made through this client picks it up without threading it
 * through every call site. */
export function setAuthToken(token: string | null) {
  authToken = token;
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | undefined>;
}

/**
 * Thin fetch wrapper: builds the URL, attaches the bearer token and JSON
 * headers, and throws a typed `ApiError` for any non-2xx response so
 * callers can `catch (e) { if (e instanceof ApiError) ... }` instead of
 * re-parsing `{ error: {...} }` everywhere.
 */
export async function apiRequest<T>(
  path: string,
  { method = "GET", body, query }: RequestOptions = {},
): Promise<T> {
  let url: URL;
  try {
    url = new URL(`${API_BASE_URL}${path}`);
  } catch {
    // A misconfigured NEXT_PUBLIC_API_BASE_URL (empty string rather than
    // unset — `??` only falls back on null/undefined) makes this throw
    // synchronously, before the network try/catch below even runs.
    throw new ApiError(0, {
      message: "The app isn't configured with a valid API URL.",
      code: "BAD_CONFIG",
    });
  }
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network failure, CORS, the Render free-tier instance asleep, etc.
    throw new ApiError(0, {
      message: "Couldn't reach the server. Check your connection and try again.",
      code: "NETWORK_ERROR",
    });
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    // The server (or something in front of it — a host's cold-start page,
    // a proxy error page) returned a non-JSON body. Surface this as a
    // real ApiError instead of letting a raw SyntaxError bubble up past
    // every caller's `instanceof ApiError` check and land on whatever
    // generic fallback message they show for "unrecognized error".
    throw new ApiError(response.status || 0, {
      message: response.ok
        ? "The server sent back something unexpected. Please try again."
        : `Request failed (${response.status}).`,
      code: "BAD_RESPONSE",
    });
  }

  if (!response.ok) {
    const errorBody = data as { error?: ApiErrorBody } | undefined;
    const body: ApiErrorBody = errorBody?.error ?? {
      message: response.statusText || "Request failed",
      code: "UNKNOWN",
    };
    throw new ApiError(response.status, body);
  }

  return data as T;
}
