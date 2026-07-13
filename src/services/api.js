export const apiGet = async (url) => {
  const token = localStorage.getItem("authTokenStoreAdmin");
  const storeId = localStorage.getItem("storeId");

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(storeId && { "x-tenant-id": storeId }),
    },
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch data");
  return res.json();
};

export const apiPost = async (url, body) => {
  const token = localStorage.getItem("authTokenStoreAdmin");
  const storeId = localStorage.getItem("storeId");

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      // NestJS's JWT guard requires the "Bearer " scheme
      // (ExtractJwt.fromAuthHeaderAsBearerToken) — sending the raw token
      // made every authenticated apiPost call (e.g. the logout API's
      // server-side session revocation) silently fail JWT extraction.
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(storeId && { "x-tenant-id": storeId }),
    },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const text = await response.text();

  let result;
  try {
    result = text ? JSON.parse(text) : null;
  } catch {
    result = text;
  }

  if (!response.ok) {
    throw {
      message:
        (result && result.message) ||
        (typeof result === "string" ? result : null) ||
        "Request failed",
    };
  }

  return result;
};
