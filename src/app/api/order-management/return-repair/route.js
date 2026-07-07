import { handleGETWithMap } from "@/lib/apiHandler";

const REPAIR_STATUS = {
  new: "submitted",
  received: "submitted",
  ready: "in_progress",
  declined: "rejected",
};

function mapRepair(r) {
  return {
    ...r,
    order_id: r.id,
    full_name: r.name,
    phone_number: r.phone,
    jewellery_type: r.serviceType,
    preferred_action: r.details,
    files: Array.isArray(r.attachments)
      ? r.attachments
      : r.attachments
      ? [r.attachments]
      : [],
    status: REPAIR_STATUS[r.status] ?? r.status,
  };
}

export async function GET(req) {
  const authHeader = req.headers.get("authorization");
  const { searchParams } = new URL(req.url);
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "20";
  return handleGETWithMap(
    `/api/v1/storefront/resize-repair-requests?page=${page}&limit=${limit}`,
    { Authorization: authHeader },
    mapRepair
  );
}
