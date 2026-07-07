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
    return { width: 1200, height: 900 };
  }

  return { width: 1200, height: 1800 };
}

type OrderLabelProps = {
  order: DetailedOrder;
  size: LabelSize;
  logoSrc?: string;
  sequenceLabel?: string;
};

export function OrderLabel({ order, size, logoSrc, sequenceLabel }: OrderLabelProps) {
  const compact = size === "4x3";
  const cornerLogoSize = compact ? 160 : 240;
  const titleSize = compact ? 52 : 84;
  const pickupDateSize = compact ? 42 : 64;
  const itemSize = compact ? 34 : 46;
  const metaValueSize = compact ? 30 : 40;
  const notesSize = compact ? 26 : 34;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "#ffffff",
        color: "#10243f",
        padding: compact ? "20px 22px" : "32px 36px",
        backgroundImage:
          "linear-gradient(180deg, rgba(244,248,255,0.72) 0%, rgba(255,255,255,0) 18%)",
        fontFamily: "Avenir Next, Trebuchet MS, Arial, sans-serif"
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: compact ? 16 : 22 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: compact ? 16 : 24
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: compact ? 12 : 14,
              flex: 1,
              minWidth: 0,
              paddingRight: compact ? 10 : 16
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: compact ? 18 : 24,
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
                display: "flex",
                fontSize: compact ? 18 : 24,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                color: "#38506e"
              }}
            >
              Noutotilaus
            </div>
            <div
              style={{
                display: "flex",
                fontSize: titleSize,
                lineHeight: 0.9,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                color: "#0d3774"
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
              justifyContent: "center",
              gap: compact ? 8 : 10,
              flexShrink: 0,
              width: compact ? 180 : 260,
              minHeight: compact ? 160 : 240
            }}
          >
            {logoSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Forelli"
                height={cornerLogoSize}
                src={logoSrc}
                style={{
                  objectFit: "contain",
                  filter: "drop-shadow(0 16px 28px rgba(13, 55, 116, 0.12))"
                }}
                width={cornerLogoSize}
              />
            ) : null}
            {sequenceLabel ? (
              <div style={{ display: "flex", fontSize: compact ? 18 : 24, color: "#444444" }}>
                {sequenceLabel}
              </div>
            ) : null}
          </div>
        </div>

        <div style={{ display: "flex", gap: compact ? 12 : 16, flexWrap: "wrap" }}>
          <div
            style={{
              flex: 1,
              minWidth: compact ? "100%" : "34%",
              border: "2px solid #dbe4f3",
              borderRadius: 16,
              padding: compact ? "14px 16px" : "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "#f8fbff"
            }}
          >
            <div style={{ fontSize: compact ? 17 : 21, textTransform: "uppercase", color: "#4b6584" }}>
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
              borderRadius: 16,
              padding: compact ? "14px 16px" : "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "#f8fbff"
            }}
          >
            <div style={{ fontSize: compact ? 17 : 21, textTransform: "uppercase", color: "#4b6584" }}>
              Puhelin
            </div>
            <div style={{ display: "flex", fontSize: metaValueSize, fontWeight: 700 }}>
              {formatPhone(order.phone)}
            </div>
          </div>

          {order.email ? (
            <div
              style={{
                flex: 1,
                minWidth: compact ? "100%" : "32%",
                border: "2px solid #dbe4f3",
                borderRadius: 16,
                padding: compact ? "14px 16px" : "18px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                background: "#f8fbff"
              }}
            >
              <div style={{ fontSize: compact ? 17 : 21, textTransform: "uppercase", color: "#4b6584" }}>
                Sähköposti
              </div>
              <div style={{ display: "flex", fontSize: compact ? 22 : 28, fontWeight: 700 }}>
                {order.email}
              </div>
            </div>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: compact ? 10 : 14 }}>
          {order.order_items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "center",
                borderBottom: "3px dashed #c6d6eb",
                paddingBottom: compact ? 10 : 14,
                paddingTop: compact ? 8 : 10
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: itemSize,
                  fontWeight: 800,
                  maxWidth: "74%",
                  color: "#0d3774"
                }}
              >
                {item.product_name}
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: itemSize,
                  fontWeight: 800,
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
              borderRadius: 16,
              padding: compact ? "14px 16px" : "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
              background: "#f8fbff"
            }}
          >
            <div style={{ fontSize: compact ? 17 : 21, textTransform: "uppercase", color: "#4b6584" }}>
              Lisatiedot
            </div>
            <div style={{ display: "flex", fontSize: notesSize }}>{order.notes}</div>
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
          paddingTop: compact ? 14 : 18
        }}
      >
        <div style={{ display: "flex", fontSize: compact ? 18 : 24, color: "#4b6584" }}>
          Luotu {formatDateTime(order.created_at)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: compact ? 22 : 28, fontWeight: 700 }}>
          <div
            style={{
              width: compact ? 28 : 36,
              height: compact ? 28 : 36,
              border: "2px solid #0d3774"
            }}
          />
          Noudettu
        </div>
      </div>
    </div>
  );
}
