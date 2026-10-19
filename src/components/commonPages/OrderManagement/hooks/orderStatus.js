// Shared order-status helpers for the orders screen.
//
// The upstream orders API returns free-form status strings ("Order Placed",
// "Pending", "Confirmed", …). These helpers give the page one canonical
// vocabulary to sort the status tabs, bucket the KPI cards and decide what
// counts as "today" — so a status is never spelled two different ways in two
// different places.

export const ORDER_STATUS_ORDER = [
  "Order Placed",
  "Pending",
  "Confirmed",
  "In Production",
  "Processing",
  "Picking",
  "Packing",
  "Shipped",
  "Shipping",
  "Delivered",
  "Cancelled",
  "Returned",
  "Refunded",
];

// Statuses that still need a human to action them.
const PENDING_STATUSES = new Set([
  "order placed",
  "pending",
  "new",
  "unpaid",
  "awaiting payment",
]);

// Statuses that are in the fulfilment pipeline (confirmed → packed).
const PROCESSING_STATUSES = new Set([
  "confirmed",
  "in production",
  "processing",
  "picking",
  "packing",
]);

export const normalizeStatus = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

export const orderStatusOf = (order) =>
  order?.order_status || order?.orderStatus || "Unknown";

export const isPendingStatus = (order) =>
  PENDING_STATUSES.has(normalizeStatus(orderStatusOf(order)));

export const isProcessingStatus = (order) =>
  PROCESSING_STATUSES.has(normalizeStatus(orderStatusOf(order)));

// True when the given timestamp falls on the current calendar day.
export const isToday = (value) => {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
};
