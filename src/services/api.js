const baseUrl = (import.meta.env?.VITE_API_BASE_URL || "http://localhost:3001").replace(/\/$/, "");
let sessionGeneration = 0;

export function advanceSessionGeneration() {
  sessionGeneration += 1;
}

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

export async function apiRequest(path, { method = "GET", body, signal, sessionRequired = false } = {}) {
  const requestGeneration = sessionGeneration;
  let response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method,
      credentials: "include",
      signal,
      headers: body === undefined ? {} : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Could not connect to the server. Please try again.", 0);
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ApiError("The server returned an invalid response.", response.status);
  }
  if (!response.ok) {
    if (response.status === 401 && sessionRequired && requestGeneration === sessionGeneration) {
      advanceSessionGeneration();
      window.dispatchEvent(new Event("auth:expired"));
    }
    const details = payload.error?.details || [];
    const message = details.length
      ? details.map(({ field, message: detail }) => `${field || "Request"}: ${detail}`).join(" ")
      : payload.error?.message || (response.status === 403 ? "You do not have permission for this action." : "The request failed.");
    throw new ApiError(message, response.status, details);
  }
  return payload;
}

export async function fetchAllPages(path, { signal, sessionRequired = false } = {}) {
  const items = [];
  let page = 1;
  let totalPages;
  do {
    const response = await apiRequest(`${path}?page=${page}&limit=100`, { signal, sessionRequired });
    items.push(...response.data);
    totalPages = response.pagination.totalPages;
    page += 1;
  } while (page <= totalPages);
  return items;
}
