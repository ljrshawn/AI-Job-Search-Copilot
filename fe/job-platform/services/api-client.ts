import { env, requireEnv } from "@/lib/config";

type QueryValue = string | number | boolean | null | undefined;
export const API_UNAUTHORIZED_EVENT = "api:unauthorized";

type ApiRequestOptions = Omit<RequestInit, "body" | "method"> & {
  query?: Record<string, QueryValue>;
  handleUnauthorized?: boolean;
};

type ApiResponse<TResponse> = Response & {
  json(): Promise<TResponse>;
};

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  const apiBaseUrl = requireEnv(
    env.apiBaseUrl,
    "API_BASE_URL or NEXT_PUBLIC_API_BASE_URL",
  );
  const baseUrl = apiBaseUrl.endsWith("/") ? apiBaseUrl : `${apiBaseUrl}/`;
  const requestPath = path.replace(/^\/+/, "");
  const url = new URL(requestPath, baseUrl);

  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

function isJsonBody(body: unknown) {
  return (
    body !== undefined && !(body instanceof FormData) && !(body instanceof Blob)
  );
}

function notifyUnauthorized() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(API_UNAUTHORIZED_EVENT));
  }
}

async function apiFetch<TResponse>(
  path: string,
  {
    body,
    method,
    query,
    headers,
    handleUnauthorized = true,
    ...options
  }: ApiRequestOptions & { body?: unknown; method: "GET" | "POST" },
) {
  const requestHeaders = new Headers(headers);

  if (isJsonBody(body) && !requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const response = await fetch(buildUrl(path, query), {
    ...options,
    method,
    headers: requestHeaders,
    body: isJsonBody(body) ? JSON.stringify(body) : (body as BodyInit | null),
  });

  if (response.status === 401 && handleUnauthorized) {
    notifyUnauthorized();
  }

  return response as ApiResponse<TResponse>;
}

export const apiClient = {
  get<TResponse>(path: string, options?: ApiRequestOptions) {
    return apiFetch<TResponse>(path, {
      ...options,
      method: "GET",
    });
  },

  post<TResponse>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return apiFetch<TResponse>(path, {
      ...options,
      method: "POST",
      body,
    });
  },
};
