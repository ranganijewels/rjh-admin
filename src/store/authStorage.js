export const loadAuthState = () => {
  try {
    if (typeof window === "undefined") return undefined;

    const serialized = window.localStorage.getItem("auth");
    if (serialized !== null) {
      return JSON.parse(serialized);
    }

    const match = document.cookie.match(/(^| )token=([^;]+)/);
    const token = match ? match[2] : null;
    if (token) {
      return { token };
    }

    return undefined;
  } catch (e) {
    console.error("Error loading auth state:", e);
    return undefined;
  }
};

export const saveAuthState = (state) => {
  try {
    if (typeof window === "undefined") return;

    window.localStorage.setItem("auth", JSON.stringify(state));

    if (state?.token) {
      document.cookie = `token=${state.token}; path=/; secure; SameSite=Strict;`;
      // Keep the key the API layer used to read in step with the persisted
      // slice, so a restored session and a fresh login behave the same.
      window.localStorage.setItem("authTokenStoreAdmin", state.token);
    } else {
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.localStorage.removeItem("authTokenStoreAdmin");
    }
  } catch (e) {
    console.error("Error saving auth state:", e);
  }
};
