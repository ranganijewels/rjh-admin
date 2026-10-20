"use client";
import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/common/ui/sheet";
import { ScrollArea } from "@/components/common/ui/scroll-area";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/common/ui/cards/card";
import { Button } from "@/components/common/ui/button";
import ConfirmDialog from "@/components/common/ui/ConfirmDialog";
import { StatusBadge } from "@/components/common/ui/badge";
import { StepProgress } from "@/components/common/ui/step-progress";
import { SummaryGrid } from "@/components/common/ui/summary-grid";
import { Input } from "@/components/common/ui/input";
import { Label } from "@/components/common/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/common/ui/select";
import { Download, Truck, TriangleAlert } from "lucide-react";
import { formatDateShort } from "@/lib/utils";
import OrderLineItems from "./OrderLineItems";

// Fulfillment pipeline — the operational lifecycle of a luxury order.
const FULFILLMENT_STAGES = [
  "Order Placed",
  "Confirmed",
  "In Production",
  "Picking",
  "Packing",
  "Shipped",
  "Delivered",
];

const ViewOrders = ({ open, onClose, orderId, orders }) => {
  const [invoiceBusy, setInvoiceBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [tracking, setTracking] = useState("");
  const [courier, setCourier] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    if (orders) {
      setStatus(orders.order_status || orders.orderStatus || "Order Placed");
      setTracking(orders.trackingNumber || orders.tracking_number || "");
      setCourier(orders.courierName || orders.courier_name || "");
      setSavedMsg("");
    }
  }, [orders]);

  const orderRowId = orders?.id;

  const handleSaveFulfillment = async () => {
    if (!orderRowId) return;
    setSaving(true);
    setSavedMsg("");
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authTokenStoreAdmin")
          : null;
      const res = await fetch(`/api/order-management/${orderRowId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          status,
          trackingNumber: tracking,
          courierName: courier,
        }),
      });
      if (res.ok) {
        setSavedMsg("Fulfillment updated");
      } else {
        const j = await res.json().catch(() => ({}));
        setSavedMsg(j?.message || j?.error || "Update failed");
      }
    } catch (e) {
      setSavedMsg(e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 3500);
    }
  };

  const currentStageIdx = FULFILLMENT_STAGES.findIndex(
    (s) => s.toLowerCase() === (status || "").toLowerCase()
  );

  // Cancelling an order is destructive, so it goes through the app's
  // ConfirmDialog rather than the browser's native confirm().
  const [cancelOpen, setCancelOpen] = useState(false);

  const requestCancelOrder = () => {
    if (!orderRowId) return;
    setCancelOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!orderRowId) return;
    setCancelOpen(false);
    setStatus("Cancelled");
    setSaving(true);
    setSavedMsg("");
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("authTokenStoreAdmin")
          : null;
      const res = await fetch(`/api/order-management/${orderRowId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          status: "Cancelled",
          trackingNumber: tracking,
          courierName: courier,
        }),
      });
      if (res.ok) {
        setSavedMsg("Order cancelled");
      } else {
        const j = await res.json().catch(() => ({}));
        setSavedMsg(j?.message || j?.error || "Cancel failed");
      }
    } catch (e) {
      setSavedMsg(e.message);
    } finally {
      setSaving(false);
      setTimeout(() => setSavedMsg(""), 3500);
    }
  };

  const handleDownloadInvoice = async () => {
    if (!orders) return;
    setInvoiceBusy(true);
    try {
      const mod = await import("@/lib/invoice/orderInvoice");
      await mod.downloadOrderInvoice(orders);
    } catch (err) {
      console.error("Invoice generation failed:", err);
    } finally {
      setInvoiceBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:w-[760px] top-2 sm:top-5 bottom-2 sm:bottom-5 end-2 sm:end-5 h-auto rounded-lg p-0 sm:max-w-none [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="border-b border-border px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
            <div className="min-w-0">
              <SheetTitle className="flex flex-wrap items-center gap-2.5">
                <span className="font-mono text-base font-semibold text-foreground">
                  {orders?.order_number || orders?.orderNumber || "Order"}
                </span>
                <StatusBadge status={orders?.order_status || "Pending"} />
              </SheetTitle>
              <p className="mt-1 text-xs text-muted-foreground">
                Placed {formatDateShort(orders?.created_at)} ·{" "}
                {orders?.total_quantity ?? orders?.items?.length ?? 0} item
                {(orders?.total_quantity ?? orders?.items?.length ?? 0) === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleDownloadInvoice}
              disabled={invoiceBusy || !orders}
            >
              <Download className="size-3.5" />
              {invoiceBusy ? "Preparing…" : "Download Invoice"}
            </Button>
          </div>
        </SheetHeader>

        <SheetBody className="px-0 py-0">
          <ScrollArea className="h-[calc(100dvh-9.5rem)]">
            <div className="flex flex-col gap-5 px-5 py-5">
              {/* ─── THE ORDER AT A GLANCE ─────────────────────────────── */}
              <Card>
                <CardHeader className="justify-start bg-muted/60 h-auto px-5 py-3.5">
                  <span className="text-sm font-semibold text-foreground">
                    Summary
                  </span>
                </CardHeader>
                <CardContent className="p-5">
                  <SummaryGrid
                    columns={3}
                    items={[
                      [
                        "Total",
                        Number.isFinite(Number(orders?.subtotal))
                          ? `$${Number(orders.subtotal).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : "—",
                      ],
                      [
                        "Payment",
                        `${orders?.payment_method || "COD"} · ${
                          orders?.payment_status || "Pending"
                        }` +
                          (orders?.currency_code &&
                          orders.currency_code !== "USD" &&
                          orders?.charged_amount
                            ? ` (charged ${orders.currency_code} ${Number(
                                orders.charged_amount
                              ).toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })})`
                            : ""),
                      ],
                      ["Ship to", orders?.customer_name || "—"],
                      [
                        "Order ID",
                        orders?.id || "—",
                        { className: "font-mono text-xs" },
                      ],
                      ["Estimated delivery", orders?.estimated_delivery || "—"],
                      [
                        "Payment status",
                        orders?.payment_status || "Pending",
                      ],
                    ]}
                  />
                </CardContent>
              </Card>

              {/* ─── WHAT WAS ORDERED ──────────────────────────────────── */}
              <Card>
                <CardHeader className="justify-start bg-muted/60 h-auto px-5 py-3.5">
                  <span className="text-sm font-semibold text-foreground">
                    Items
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {orders?.items?.length || 0} line
                    {orders?.items?.length === 1 ? "" : "s"}
                  </span>
                </CardHeader>
                <CardContent className="p-5">
                  <OrderLineItems items={orders?.items || []} />
                </CardContent>
              </Card>

              {/* ─── FULFILMENT CONTROL ───────────────────────────────── */}
              <Card className="overflow-hidden border-primary/20">
                <CardHeader className="justify-start bg-primary gap-2 h-auto px-5 py-3.5 flex-row items-center">
                  <Truck className="size-4 text-primary-foreground" />
                  <span className="text-sm font-semibold text-primary-foreground">
                    Fulfilment &amp; Shipping
                  </span>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                  <div className="-mx-1 overflow-x-auto px-1 pb-1">
                    <StepProgress
                      steps={FULFILLMENT_STAGES}
                      currentIndex={currentStageIdx}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`order-status-${orderRowId ?? "new"}`}
                        className="text-xs text-muted-foreground"
                      >
                        Status
                      </Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger
                          id={`order-status-${orderRowId ?? "new"}`}
                          className="w-full"
                        >
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          {FULFILLMENT_STAGES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                          <SelectItem value="Cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`order-courier-${orderRowId ?? "new"}`}
                        className="text-xs text-muted-foreground"
                      >
                        Courier
                      </Label>
                      <Input
                        id={`order-courier-${orderRowId ?? "new"}`}
                        value={courier}
                        onChange={(e) => setCourier(e.target.value)}
                        placeholder="FedEx, DHL, Brinks…"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <Label
                        htmlFor={`order-tracking-${orderRowId ?? "new"}`}
                        className="text-xs text-muted-foreground"
                      >
                        Tracking #
                      </Label>
                      <Input
                        id={`order-tracking-${orderRowId ?? "new"}`}
                        value={tracking}
                        onChange={(e) => setTracking(e.target.value)}
                        placeholder="Tracking number"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      onClick={handleSaveFulfillment}
                      disabled={saving || !orderRowId}
                    >
                      {saving ? "Saving…" : "Update Fulfilment"}
                    </Button>
                    {savedMsg && (
                      <span
                        className="text-sm font-medium text-success"
                        role="status"
                        aria-live="polite"
                        aria-atomic="true"
                      >
                        {savedMsg}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* ─── SHIPPING DATA ────────────────────────────────────── */}
              <Card>
                <CardHeader className="justify-start bg-muted/60 h-auto px-5 py-3.5">
                  <span className="text-sm font-semibold text-foreground">
                    Shipping details
                  </span>
                </CardHeader>
                <CardContent className="p-5">
                  <SummaryGrid
                    columns={4}
                    items={[
                      [
                        "Courier",
                        orders?.courierName || orders?.courier_name || "—",
                      ],
                      [
                        "Tracking #",
                        orders?.trackingNumber || orders?.tracking_number || "—",
                      ],
                      [
                        "Shipped",
                        (orders?.shippedAt || orders?.shipped_at)
                          ? formatDateShort(
                              orders?.shippedAt || orders?.shipped_at
                            )
                          : "—",
                      ],
                      [
                        "Delivered",
                        (orders?.deliveredAt || orders?.delivered_at)
                          ? formatDateShort(
                              orders?.deliveredAt || orders?.delivered_at
                            )
                          : "—",
                      ],
                    ]}
                  />
                  {(orders?.trackingUrl || orders?.tracking_url) && (
                    <a
                      href={orders?.trackingUrl || orders?.tracking_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 inline-block text-sm font-medium text-primary underline underline-offset-4"
                    >
                      Track this shipment
                    </a>
                  )}
                </CardContent>
              </Card>

              {/* ─── DESTRUCTIVE ACTIONS ──────────────────────────────── */}
              <Card className="border-destructive/25 bg-destructive/[0.03]">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div className="flex items-start gap-2.5">
                    <TriangleAlert
                      className="mt-0.5 size-4 shrink-0 text-destructive"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Cancel this order
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Cancelling cannot be undone.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled
                      title="Notify Customer is not yet available"
                    >
                      Notify customer
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={requestCancelOrder}
                      disabled={saving || !orderRowId}
                    >
                      Cancel order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </ScrollArea>
        </SheetBody>
      </SheetContent>

      <ConfirmDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancelOrder}
        title="Cancel order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmLabel="Cancel order"
      />
    </Sheet>
  );
};

export default ViewOrders;
