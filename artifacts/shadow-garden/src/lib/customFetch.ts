export function customFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem("sg_token");
  const headers: Record<string, string> = {
    ...(init?.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return fetch(input, { ...init, headers });
}
