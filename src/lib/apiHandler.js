import { NextResponse } from "next/server";

const NEST = process.env.NEXT_PUBLIC_NEST_API_URL || "http://localhost:4000";
const TENANT = process.env.NEXT_PUBLIC_TENANT_ID || "00000000-0000-0000-0000-000000000001";

// Transform NestJS responses into the shape the frontend expects:
// Paginated list: { data: [...], meta: { current_page, last_page, total, per_page } }
// Single item: { data: {...} }
function transform(nestJson) {
  if (!nestJson || nestJson.success === false) return nestJson;

  // Pattern 1: { success, data: [...], meta: { page, totalPages, total, limit } }  ← NestJS paginate()
  if (Array.isArray(nestJson.data) && nestJson.meta) {
    const m = nestJson.meta;
    return {
      data: nestJson.data,
      meta: {
        current_page: m.page || 1,
        last_page: m.totalPages || 1,
        total: m.total || 0,
        per_page: m.limit || 10,
        links: [],
      },
    };
  }

  const payload = nestJson.data ?? nestJson;

  // Pattern 2: nested paginated  ← { data: [...], meta|total|page|limit }
  if (
    payload &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    Array.isArray(payload.data)
  ) {
    const m = payload.meta || {};
    const page = m.page ?? payload.page ?? 1;
    const limit = m.limit ?? payload.limit ?? 10;
    const total = m.total ?? payload.total ?? 0;
    const totalPages = m.totalPages ?? (Math.ceil(total / limit) || 1);
    return {
      data: payload.data,
      meta: {
        current_page: page,
        last_page: totalPages,
        total: total,
        per_page: limit,
        links: [],
      },
    };
  }

  if (Array.isArray(payload)) {
    return { data: payload };
  }

  return { data: payload };
}

function nestHeaders(customHeaders = {}) {
  return {
    "Content-Type": "application/json",
    "x-tenant-id": TENANT,
    Accept: "application/json",
    ...customHeaders,
  };
}

export async function handleGET(apiPath, customHeaders = {}, queryParams = {}) {
  try {
    const qs = new URLSearchParams(queryParams).toString();
    const url = `${NEST}${apiPath}${qs ? `?${qs}` : ""}`;
    const res = await fetch(url, {
      method: "GET",
      headers: nestHeaders(customHeaders),
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(transform(data), { status: res.ok ? 200 : res.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function handleGETWithMap(apiPath, customHeaders = {}, itemMapper) {
  try {
    const url = `${NEST}${apiPath}`;
    const res = await fetch(url, {
      method: "GET",
      headers: nestHeaders(customHeaders),
      cache: "no-store",
    });
    const raw = await res.json();
    const transformed = transform(raw);
    if (itemMapper && transformed && transformed.data) {
      transformed.data = Array.isArray(transformed.data)
        ? transformed.data.map(itemMapper)
        : itemMapper(transformed.data);
    }
    return NextResponse.json(transformed, { status: res.ok ? 200 : res.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function fetchGET(api, headers = {}, query = {}) {
  const qs = new URLSearchParams(query).toString();
  const url = `${api}${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { headers: nestHeaders(headers) });
  const data = await res.json();
  return transform(data);
}

export async function handlePOST(req, apiPath, customHeaders = {}) {
  try {
    const authHeader = customHeaders.Authorization || req.headers.get("authorization");
    let body;
    const contentType = req.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      body = JSON.stringify(await req.json());
    }
    const response = await fetch(`${NEST}${apiPath}`, {
      method: "POST",
      headers: nestHeaders({ ...customHeaders, ...(authHeader && { Authorization: authHeader }) }),
      body,
    });
    const data = await response.json();
    return NextResponse.json(transform(data), { status: response.ok ? 200 : response.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function handlePUT(req, apiPath, customHeaders = {}) {
  try {
    const body = await req.json();
    const response = await fetch(`${NEST}${apiPath}`, {
      method: "PUT",
      headers: nestHeaders(customHeaders),
      body: JSON.stringify(body),
    });
    const data = await response.json();
    return NextResponse.json(transform(data), { status: response.ok ? 200 : response.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function handlePATCH(apiPath, body, customHeaders = {}) {
  try {
    const res = await fetch(`${NEST}${apiPath}`, {
      method: "PATCH",
      headers: nestHeaders(customHeaders),
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(transform(data), { status: res.ok ? 200 : res.status });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function handleDELETE(apiPath, body = null, headers = {}) {
  try {
    const res = await fetch(`${NEST}${apiPath}`, {
      method: "DELETE",
      headers: nestHeaders(headers),
      ...(body && { body: JSON.stringify(body) }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: "Failed to delete", details: errorText },
        { status: res.status }
      );
    }
    const data = await res.json().catch(() => ({ success: true }));
    return NextResponse.json(transform(data));
  } catch (error) {
    return NextResponse.json(
      { error: "Server error", details: error.message },
      { status: 500 }
    );
  }
}
