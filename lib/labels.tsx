import type { DetailedOrder } from "@/lib/types";
import {
  formatDateTime,
  formatPickupDate,
  formatPhone,
  formatQuantity
} from "@/lib/utils/format";

export type LabelSize = "4x6" | "4x3";

export function getLabelSize(size?: string): LabelSize {
  return size === "4x3" ? "4x3" : "4x6";
}

export function getLabelDimensions(size: LabelSize) {
  if (size === "4x3") {
    return { width: 812, height: 609 };
  }

  return { width: 812, height: 1218 };
}

type OrderLabelProps = {
  order: DetailedOrder;
  size: LabelSize;
  logoSrc?: string;
  sequenceLabel?: string;
};

export function OrderLabel({ order, size, logoSrc, sequenceLabel }: OrderLabelProps) {
  const compact = size === "4x3";
  const cornerLogoSize = compact ? 88 : 116;
  const titleSize = compact ? 32 : 40;
  const pickupDateSize = compact ? 30 : 40;
  const itemSize = compact ? 22 : 24;
  const statusLabel =
    order.status === "kasittelyssa"
      ? "käsittelyssä"
      : order.status;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#ffffff",
        color: "#111111",
        border: "3px solid #111111",
        padding: compact ? "24px" : "28px",
        fontFamily: "Avenir Next, Trebuchet MS, Arial, sans-serif"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 14 : 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minWidth: 0, paddingRight: 12 }}>
            <div
              style={{
                display: "flex",
                fontSize: compact ? 16 : 18,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "#0d3774"
              }}
            >
              Forelli
            </div>
            <div
              style={{
                display: "flex",
                fontSize: compact ? 16 : 18,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#38506e"
              }}
            >
              Noutotilaus
            </div>
            <div
              style={{
                display: "flex",
                fontSize: titleSize,
                lineHeight: 1,
                fontWeight: 800
              }}
            >
              {order.customer_name}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 8,
              flexShrink: 0,
              width: compact ? 150 : 184
            }}
          >
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Forelli"
                height={cornerLogoSize}
                src={logoSrc}
                style={{ objectFit: "contain" }}
                width={cornerLogoSize}
              />
            ) : null}
            <div
              style={{
                display: "flex",
                border: "2px solid #0d3774",
                borderRadius: 999,
                padding: compact ? "8px 12px" : "8px 14px",
                fontSize: compact ? 16 : 18,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#0d3774",
                background: "#eef4ff"
              }}
            >
              {statusLabel}
            </div>
            {sequenceLabel ? (
              <div style={{ display: "flex", fontSize: compact ? 14 : 16, color: "#444444" }}>
                {sequenceLabel}
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <div
            style={{
              flex: 1,
              minWidth: compact ? "100%" : "34%",
              border: "2px solid #dbe4f3",
              borderRadius: 14,
              padding: compact ? "12px 14px" : "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              background: "#f8fbff"
            }}
          >
            <div style={{ fontSize: compact ? 15 : 16, textTransform: "uppercase", color: "#4b6584" }}>
              Noutopäivä
            </div>
            <div style={{ display: "flex", fontSize: pickupDateSize, fontWeight: 800, lineHeight: 1 }}>
              {formatPickupDate(order.pickup_date)}
            </div>
          </div>

          <div
            style={{
              flex: 1,
              minWidth: compact ? "100%" : "28%",
              border: "2px solid #dbe4f3",
              borderRadius: 14,
              padding: compact ? "12px 14px" : "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              background: "#f8fbff"
            }}
          >
            <div style={{ fontSize: compact ? 15 : 16, textTransform: "uppercase", color: "#4b6584" }}>
              Puhelin
            </div>
            <div style={{ display: "flex", fontSize: compact ? 20 : 22, fontWeight: 700 }}>
              {formatPhone(order.phone)}
            </div>
          </div>

          {order.email ? (
            <div
              style={{
                flex: 1,
                minWidth: compact ? "100%" : "32%",
                border: "2px solid #dbe4f3",
                borderRadius: 14,
                padding: compact ? "12px 14px" : "14px 16px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
                background: "#f8fbff"
              }}
            >
              <div style={{ fontSize: compact ? 15 : 16, textTransform: "uppercase", color: "#4b6584" }}>
                Sähköposti
              </div>
              <div style={{ display: "flex", fontSize: compact ? 16 : 18, fontWeight: 700 }}>
                {order.email}
              </div>
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {order.order_items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "center",
                borderBottom: "2px dashed #c6d6eb",
                paddingBottom: compact ? 6 : 8,
                paddingTop: compact ? 2 : 4
              }}
            >
              <div style={{ display: "flex", fontSize: itemSize, fontWeight: 700, maxWidth: "72%" }}>
                {item.product_name}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: itemSize,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  flexShrink: 0
                }}
              >
                {formatQuantity(item.quantity_grams)}
              </div>
            </div>
          ))}
        </div>

        {order.notes ? (
          <div
            style={{
              border: "2px dashed #bdd0ea",
              borderRadius: 14,
              padding: compact ? "12px 14px" : "14px 16px",
              display: "flex",
              flexDirection: "column",
              gap: 6,
              background: "#f8fbff"
            }}
          >
            <div style={{ fontSize: compact ? 15 : 16, textTransform: "uppercase", color: "#4b6584" }}>
              Lisatiedot
            </div>
            <div style={{ display: "flex", fontSize: compact ? 18 : 20 }}>{order.notes}</div>
          </div>
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          borderTop: "2px solid #dbe4f3",
          paddingTop: compact ? 10 : 14
        }}
      >
        <div style={{ display: "flex", fontSize: compact ? 16 : 18, color: "#4b6584" }}>
          Luotu {formatDateTime(order.created_at)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: compact ? 18 : 20, fontWeight: 700 }}>
          <div
            style={{
              width: compact ? 22 : 26,
              height: compact ? 22 : 26,
              border: "2px solid #0d3774"
            }}
          />
          Noudettu
        </div>
      </div>
    </div>
  );
}
