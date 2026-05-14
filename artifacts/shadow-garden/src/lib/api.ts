const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

export function getApiUrl(path: string) {
  return `${BASE}${path}`;
}

export function authFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem("sg_token");
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!headers["Content-Type"] && init?.body) headers["Content-Type"] = "application/json";
  return fetch(input, { ...init, headers });
}
