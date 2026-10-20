/**
 * The bearer token the admin API calls use.
 *
 * Two places hold it:
 *
 *   - `localStorage.authTokenStoreAdmin` — written by the login thunk.
 *   - `localStorage.auth` — the redux-persisted auth slice, which holds
 *     `{ user, token }` and is written on every store change.
 *
 * Only the first is written when an admin logs in. A session that was
 * restored from storage (a reload, a new tab, a session that started
 * elsewhere) therefore had no `authTokenStoreAdmin`, and every API call
 * went out without an Authorization header — which the backend answers
 * with a 401. Reading the persisted slice as the fallback makes the two
 * agree.
 */
export function getAuthToken() {
  if (typeof window === "undefined") return null;

  const direct = window.localStorage.getItem("authTokenStoreAdmin");
  if (direct) return direct;

  try {
    const auth = JSON.parse(window.localStorage.getItem("auth") || "null");
    return auth?.token || null;
  } catch {
    return null;
  }
}

export default getAuthToken;
