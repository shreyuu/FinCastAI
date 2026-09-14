// frontend/src/services/api.ts
//
// Single source of truth for backend origins. Set VITE_API_URL and
// VITE_AUTH_URL to deploy anywhere other than a developer laptop.

export const API = {
  BACKEND: import.meta.env.VITE_API_URL || "http://localhost:8000",
  AUTH: import.meta.env.VITE_AUTH_URL || "http://localhost:3001",
};

/** URL on the FastAPI prediction backend. */
export function backendUrl(path: string) {
  return `${API.BACKEND.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

/** URL on the Express auth server. */
export function authUrl(path: string) {
  return `${API.AUTH.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
