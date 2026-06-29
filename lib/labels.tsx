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
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: "72%" }}>
            <div
              style={{
                fontSize: compact ? 18 : 20,
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                color: "#0d3774"
              }}
            >
              Forelli
            </div>
            <div
              style={{
                fontSize: compact ? 18 : 20,
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
                fontSize: compact ? 38 : 46,
                lineHeight: 1.05,
                fontWeight: 700
              }}
            >
              {order.customer_name}
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8 }}>
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Forelli"
                height={compact ? 56 : 72}
                src={logoSrc}
                style={{ objectFit: "contain" }}
                width={compact ? 56 : 72}
              />
            ) : null}
            <div
              style={{
                border: "2px solid #0d3774",
                borderRadius: 999,
                padding: compact ? "8px 12px" : "10px 14px",
                fontSize: compact ? 18 : 20,
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#0d3774",
                background: "#eef4ff"
              }}
            >
              {order.status}
            </div>
            {sequenceLabel ? (
              <div style={{ fontSize: compact ? 16 : 18, color: "#444444" }}>{sequenceLabel}</div>
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
              Noutopaiva
            </div>
            <div style={{ fontSize: compact ? 24 : 28, fontWeight: 700 }}>
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
            <div style={{ fontSize: compact ? 22 : 26, fontWeight: 700 }}>{formatPhone(order.phone)}</div>
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
                Sahkoposti
              </div>
              <div style={{ fontSize: compact ? 18 : 20, fontWeight: 700 }}>{order.email}</div>
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
                alignItems: "baseline",
                borderBottom: "2px dashed #c6d6eb",
                paddingBottom: 8
              }}
            >
              <div style={{ fontSize: compact ? 24 : 28, fontWeight: 700 }}>{item.product_name}</div>
              <div style={{ fontSize: compact ? 24 : 28, fontWeight: 700, whiteSpace: "nowrap" }}>
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
            <div style={{ fontSize: compact ? 20 : 22 }}>{order.notes}</div>
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
        <div style={{ fontSize: compact ? 16 : 18, color: "#4b6584" }}>
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
