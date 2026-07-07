"use client";

// Client-side luxury invoice generator for the admin order detail.
// Reads the raw NestJS order entity (camelCase, one product per order row).
// Uses @react-pdf/renderer built-in fonts so the download never depends on a
// remote web-font load.
import {
  Document,
  Page,
  View,
  Text,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";

const TEAL = "#2f6f7a";
const DARK = "#222223";
const GOLD = "#b08d57";
const MUTED = "#6b7280";
const LINE = "#e5e7eb";

const money = (n, symbol = "$") =>
  `${symbol}${(Number(n) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const fmtDate = (d) => {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "—";
  }
};

const styles = StyleSheet.create({
  page: { paddingTop: 44, paddingBottom: 56, paddingHorizontal: 44, fontFamily: "Helvetica", fontSize: 9.5, color: DARK },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  brand: { fontFamily: "Times-Roman", fontSize: 26, letterSpacing: 3, color: DARK },
  brandTag: { fontSize: 7.5, letterSpacing: 2.5, color: GOLD, marginTop: 3 },
  invoiceTitle: { fontFamily: "Times-Roman", fontSize: 22, letterSpacing: 4, color: TEAL, textAlign: "right" },
  metaLine: { fontSize: 9, color: MUTED, textAlign: "right", marginTop: 3 },
  metaStrong: { fontSize: 9, color: DARK, textAlign: "right", marginTop: 3 },
  rule: { height: 2, backgroundColor: GOLD, marginTop: 14, marginBottom: 18 },
  partiesRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 22 },
  partyCol: { width: "48%" },
  label: { fontSize: 7.5, letterSpacing: 1.5, color: GOLD, fontFamily: "Helvetica-Bold", marginBottom: 5 },
  partyName: { fontSize: 11, fontFamily: "Helvetica-Bold", color: DARK, marginBottom: 2 },
  partyText: { fontSize: 9, color: MUTED, lineHeight: 1.5 },
  tHead: { flexDirection: "row", backgroundColor: TEAL, paddingVertical: 7, paddingHorizontal: 8, borderRadius: 2 },
  tHeadCell: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 8, letterSpacing: 0.5 },
  tRow: { flexDirection: "row", paddingVertical: 9, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: LINE },
  cDesc: { width: "38%", paddingRight: 6 },
  cMeta: { width: "30%", paddingRight: 6 },
  cQty: { width: "8%", textAlign: "center" },
  cUnit: { width: "12%", textAlign: "right" },
  cAmt: { width: "12%", textAlign: "right" },
  itemTitle: { fontFamily: "Helvetica-Bold", fontSize: 9.5, color: DARK, marginBottom: 2 },
  itemSub: { fontSize: 8, color: MUTED, lineHeight: 1.4 },
  totalsWrap: { flexDirection: "row", justifyContent: "flex-end", marginTop: 16 },
  totalsBox: { width: "44%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  totalLabel: { fontSize: 9.5, color: MUTED },
  totalValue: { fontSize: 9.5, color: DARK },
  grandRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: DARK },
  grandLabel: { fontSize: 12, fontFamily: "Helvetica-Bold", color: DARK },
  grandValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: TEAL },
  badge: { alignSelf: "flex-start", marginTop: 6, paddingVertical: 2, paddingHorizontal: 7, borderRadius: 8, backgroundColor: "#eef4f5", color: TEAL, fontSize: 8, fontFamily: "Helvetica-Bold" },
  footer: { position: "absolute", bottom: 30, left: 44, right: 44 },
  footerRule: { height: 1, backgroundColor: LINE, marginBottom: 10 },
  thanks: { fontFamily: "Times-Italic", fontSize: 11, color: TEAL, marginBottom: 6 },
  footerText: { fontSize: 7.5, color: MUTED, lineHeight: 1.5 },
});

// Normalize a raw NestJS order entity into the invoice view model.
function normalize(o = {}) {
  const qty = Number(o.quantity) || 1;
  const total = Number(o.totalAmount ?? o.total) || 0;
  return {
    invoiceNo: o.orderNumber || `INV-${String(o.id || "").slice(0, 8).toUpperCase()}`,
    orderRef: o.orderNumber || o.id,
    date: o.orderDate || o.createdAt,
    status: o.orderStatus || o.status || "Confirmed",
    payment: o.paymentStatus || "Pending",
    customer: {
      name: o.customerName || o.customer?.name || "Valued Customer",
      email: o.customerEmail || o.customer?.email || "",
      phone: o.customerPhone || o.customer?.phone || "",
      address: o.customerAddress || "",
    },
    item: {
      title: o.productName || "Jewelry",
      code: o.productCode || "",
      shape: o.diamondShape || "",
      metal: [o.metalColor, o.metalType, o.metalPurity].filter(Boolean).join(" "),
      carat: Number(o.diamondWeightCt) || 0,
      size: o.productSize || "",
      qty,
      unit: qty > 0 ? total / qty : total,
      amount: total,
    },
    total,
  };
}

function InvoiceDocument({ order, symbol = "$" }) {
  const vm = normalize(order);
  const detailParts = [];
  if (vm.item.shape) detailParts.push(`Shape: ${vm.item.shape}`);
  if (vm.item.metal) detailParts.push(`Metal: ${vm.item.metal}`);
  if (vm.item.carat > 0) detailParts.push(`Diamond: ${vm.item.carat} ct`);
  if (vm.item.size) detailParts.push(`Size: ${vm.item.size}`);
  if (vm.item.code) detailParts.push(`SKU: ${vm.item.code}`);

  return (
    <Document title={`Invoice ${vm.invoiceNo}`} author="RJ House">
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.brand}>RJ HOUSE</Text>
            <Text style={styles.brandTag}>FINE JEWELLERY</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <Text style={styles.metaStrong}>{vm.invoiceNo}</Text>
            <Text style={styles.metaLine}>{fmtDate(vm.date)}</Text>
          </View>
        </View>
        <View style={styles.rule} />

        <View style={styles.partiesRow}>
          <View style={styles.partyCol}>
            <Text style={styles.label}>BILLED TO</Text>
            <Text style={styles.partyName}>{vm.customer.name}</Text>
            {!!vm.customer.email && <Text style={styles.partyText}>{vm.customer.email}</Text>}
            {!!vm.customer.phone && <Text style={styles.partyText}>{vm.customer.phone}</Text>}
            {!!vm.customer.address && <Text style={styles.partyText}>{vm.customer.address}</Text>}
          </View>
          <View style={[styles.partyCol, { alignItems: "flex-end" }]}>
            <Text style={styles.label}>DETAILS</Text>
            <Text style={styles.partyText}>Order: {vm.orderRef}</Text>
            <Text style={styles.partyText}>Date: {fmtDate(vm.date)}</Text>
            <Text style={styles.partyText}>Payment: {vm.payment}</Text>
            <Text style={styles.badge}>{String(vm.status).toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.tHead}>
          <Text style={[styles.tHeadCell, styles.cDesc]}>ITEM</Text>
          <Text style={[styles.tHeadCell, styles.cMeta]}>SPECIFICATION</Text>
          <Text style={[styles.tHeadCell, styles.cQty]}>QTY</Text>
          <Text style={[styles.tHeadCell, styles.cUnit]}>UNIT</Text>
          <Text style={[styles.tHeadCell, styles.cAmt]}>AMOUNT</Text>
        </View>
        <View style={styles.tRow} wrap={false}>
          <View style={styles.cDesc}>
            <Text style={styles.itemTitle}>{vm.item.title}</Text>
          </View>
          <Text style={[styles.itemSub, styles.cMeta]}>{detailParts.join("\n")}</Text>
          <Text style={[styles.totalValue, styles.cQty]}>{vm.item.qty}</Text>
          <Text style={[styles.totalValue, styles.cUnit]}>{money(vm.item.unit, symbol)}</Text>
          <Text style={[styles.itemTitle, styles.cAmt]}>{money(vm.item.amount, symbol)}</Text>
        </View>

        <View style={styles.totalsWrap}>
          <View style={styles.totalsBox}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal</Text>
              <Text style={styles.totalValue}>{money(vm.total, symbol)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Shipping</Text>
              <Text style={styles.totalValue}>Complimentary</Text>
            </View>
            <View style={styles.grandRow}>
              <Text style={styles.grandLabel}>Total</Text>
              <Text style={styles.grandValue}>{money(vm.total, symbol)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <View style={styles.footerRule} />
          <Text style={styles.thanks}>Thank you for choosing RJ House.</Text>
          <Text style={styles.footerText}>
            Each RJ House piece is crafted to order and accompanied by a certificate of
            authenticity. For resizing, repair, or returns, contact our concierge within 30
            days of delivery.
          </Text>
          <Text style={[styles.footerText, { marginTop: 4 }]}>
            care@rjhouse.com  ·  www.rjhouse.com  ·  This invoice was generated electronically and is valid without signature.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

async function buildBlob(order, opts = {}) {
  return pdf(<InvoiceDocument order={order} {...opts} />).toBlob();
}

export async function downloadOrderInvoice(order, opts = {}) {
  const blob = await buildBlob(order, opts);
  const invoiceNo = order?.orderNumber || `INV-${String(order?.id || "order").slice(0, 8).toUpperCase()}`;
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `RJHouse-${invoiceNo}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
