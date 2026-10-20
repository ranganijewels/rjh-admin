// A 401 can mean two very different things: the session really is gone, or
// this one endpoint rejected the token (a module the role cannot read, a
// token the service does not recognise). Reacting to the first by nuking the
// cookie and hard-navigating to /login meant a single failing request threw
// the admin out of the panel — and out of the 1,800-line product form they
// were halfway through.
//
// So the session is no longer destroyed here. The event is broadcast instead
// and SessionExpiredDialog decides what happens; the admin keeps their place
// and their unsaved work until they choose to sign in again.
import { SESSION_EXPIRED_EVENT } from "@/lib/session-events";
import { getAuthToken } from "@/lib/auth-token";

const handleSessionExpiry = (res) => {
  if (res.status !== 401 || typeof window === "undefined") return false;
  window.dispatchEvent(new CustomEvent(SESSION_EXPIRED_EVENT));
  return true;
};

export const storeAdminCrud = (baseUrl) => {
  const getAuthHeaders = () => {
    const token = getAuthToken();
    const storeId =
      typeof window !== "undefined" ? localStorage.getItem("store_id") : null;

    return {
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(storeId && { "x-tenant-id": storeId }),
      Accept: "application/json",
      "Content-Type": "application/json",
    };
  };

  return {
    fetchAll: async (payload = {}) => {
      const queryString = new URLSearchParams(payload).toString();
      const url = queryString ? `${baseUrl}?${queryString}` : baseUrl;

      const res = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (handleSessionExpiry(res)) throw new Error("Session expired");
      if (!res.ok) throw new Error("Failed to fetch data");
      return res.json();
    },
    fetchByPages: async (params = {}) => {
      const { page = 1, limit = 10, ...rest } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      // Forward every non-empty filter param (search, category_id, metal_color,
      // shape, status, …) so server-side filtering actually works.
      Object.entries(rest).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      });

      const url = `${baseUrl}?${queryParams.toString()}`;

      const res = await fetch(url, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (handleSessionExpiry(res)) throw new Error("Session expired");
      if (!res.ok) throw new Error(`Failed to fetch data from ${url}`);

      return res.json();
    },

    fetchById: async (id) => {
      const res = await fetch(`${baseUrl}/${id}`, {
        headers: getAuthHeaders(),
      });

      if (handleSessionExpiry(res)) throw new Error("Session expired");
      if (!res.ok) throw new Error("Failed to fetch data by ID");
      return await res.json();
    },

    // fetchByPages: async (params = {}) => {
    //   const { page = 1, limit = 10, search = "" } = params;
    //   const queryParams = new URLSearchParams({
    //     page: page.toString(),
    //     limit: limit.toString(),
    //   });
    //   if (search) queryParams.append("q", search);
    //   const url = `${baseUrl}?${queryParams.toString()}`;

    //   const res = await fetch(url, {
    //     method: "GET",
    //     headers: getAuthHeaders(),
    //   });
    //   if (!res.ok) throw new Error(`Failed to fetch data from ${url}`);
    //   return res.json();
    // },

    create: async (payload) => {
      const finalPayload = {
        ...payload,
        submitted: 1,
      };

      const res = await fetch(baseUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(finalPayload),
      });

      if (handleSessionExpiry(res)) throw new Error("Session expired");
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to create record");
      }

      return res.json();
    },

    update: async (id, payload) => {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify(payload),
      });

      if (handleSessionExpiry(res)) throw new Error("Session expired");
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update record");
      }
      return res.json();
    },

    remove: async (id) => {
      const res = await fetch(`${baseUrl}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (handleSessionExpiry(res)) throw new Error("Session expired");
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to delete record");
      }
      return res.json();
    },

    toggleStatus: async (id, is_active) => {
      const res = await fetch(`${baseUrl}/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ is_active }),
      });

      if (handleSessionExpiry(res)) throw new Error("Session expired");
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error.message || "Failed to toggle status");
      }
      return res.json();
    },
  };
};
