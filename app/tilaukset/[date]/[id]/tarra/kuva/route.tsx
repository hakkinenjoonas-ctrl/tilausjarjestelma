import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getOrderById } from "@/lib/data/orders";
import { getLabelDimensions, getLabelSize, OrderLabel } from "@/lib/labels";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{
    date: string;
    id: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { searchParams } = new URL(request.url);
  const size = getLabelSize(searchParams.get("size") ?? undefined);
  const { date, id } = await context.params;
  const order = await getOrderById(id);

  if (!order || order.pickup_date !== date) {
    notFound();
  }

  const { width, height } = getLabelDimensions(size);
  const logoBuffer = await readFile(path.join(process.cwd(), "public", "brand-logo.png"));
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(<OrderLabel logoSrc={logoSrc} order={order} size={size} />, {
    width,
    height,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store"
    }
  });
}
