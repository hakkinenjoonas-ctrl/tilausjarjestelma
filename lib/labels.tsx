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
  totalPriceLabel?: string | null;
  totalPriceNote?: string | null;
};

export function OrderLabel({
  order,
  size,
  logoSrc,
  sequenceLabel,
  totalPriceLabel,
  totalPriceNote
}: OrderLabelProps) {
  const compact = size === "4x3";
  const cornerLogoSize = compact ? 170 : 280;
  const titleSize = compact ? 58 : 96;
  const pickupDateSize = compact ? 48 : 96;
  const itemSize = compact ? 38 : 56;
  const metaValueSize = compact ? 32 : 46;
  const notesSize = compact ? 28 : 38;

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
            alignItems: "center",
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
                fontSize: compact ? 19 : 28,
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
                fontSize: compact ? 19 : 28,
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
                lineHeight: 0.92,
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
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              width: compact ? 186 : 292,
              minHeight: compact ? 170 : 280
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
            <div style={{ fontSize: compact ? 18 : 24, textTransform: "uppercase", color: "#4b6584" }}>
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
            <div style={{ fontSize: compact ? 18 : 24, textTransform: "uppercase", color: "#4b6584" }}>
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
              <div style={{ fontSize: compact ? 18 : 24, textTransform: "uppercase", color: "#4b6584" }}>
                Sähköposti
              </div>
              <div style={{ display: "flex", fontSize: compact ? 24 : 32, fontWeight: 700 }}>
                {order.email}
              </div>
            </div>
          ) : null}
        </div>

        {totalPriceLabel ? (
          <div
            style={{
              border: "2px solid #b8cceb",
              borderRadius: 18,
              padding: compact ? "14px 16px" : "18px 20px",
              display: "flex",
              flexDirection: "column",
              gap: compact ? 8 : 10,
              background: "linear-gradient(180deg, #f7fbff 0%, #eef5ff 100%)"
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: compact ? 18 : 24,
                textTransform: "uppercase",
                color: "#4b6584",
                letterSpacing: "0.08em"
              }}
            >
              Arvioitu yhteensä
            </div>
            <div
              style={{
                display: "flex",
                fontSize: compact ? 40 : 58,
                lineHeight: 0.95,
                fontWeight: 800,
                color: "#0d3774",
                letterSpacing: "-0.04em"
              }}
            >
              {totalPriceLabel}
            </div>
            {totalPriceNote ? (
              <div
                style={{
                  display: "flex",
                  fontSize: compact ? 18 : 24,
                  lineHeight: 1.3,
                  color: "#4b6584"
                }}
              >
                {totalPriceNote}
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={{ display: "flex", flexDirection: "column", gap: compact ? 10 : 14 }}>
          {order.order_items.map((item) => (
            <div
              key={item.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 16,
                alignItems: "baseline",
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
                  maxWidth: "76%",
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
        <div style={{ display: "flex", fontSize: compact ? 20 : 28, color: "#4b6584" }}>
          Luotu {formatDateTime(order.created_at)}
        </div>
        {sequenceLabel ? (
          <div
            style={{
              display: "flex",
              fontSize: compact ? 20 : 28,
              fontWeight: 700,
              color: "#4b6584"
            }}
          >
            {sequenceLabel}
          </div>
        ) : null}
      </div>
    </div>
  );
}
