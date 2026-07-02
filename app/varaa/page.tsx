import type { Metadata } from "next";
import { CustomerBookingForm } from "@/components/customer-booking-form";
import { EmptyState } from "@/components/empty-state";
import { getActiveProducts, getDailyFeaturedProductConfig } from "@/lib/data/orders";

export const metadata: Metadata = {
  title: "Kalakauppa Forelli | Ennakkovaraus",
  description: "Tee Kalakauppa Forellin ennakkovaraus verkossa ja valitse noutopäivä, tuotteet ja yhteystietosi."
};

type BookingPageProps = {
  searchParams: Promise<{
    pickup_date?: string;
  }>;
};

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = await searchParams;
  const [products, featuredProduct] = await Promise.all([
    getActiveProducts(),
    getDailyFeaturedProductConfig()
  ]);

  return (
    <main className="page-stack">
      {products.length > 0 ? (
        <div id="varauslomake">
          <CustomerBookingForm
            defaultPickupDate={params.pickup_date}
            featuredProduct={featuredProduct}
            products={products}
          />
        </div>
      ) : (
        <EmptyState
          title="Varauksia ei voi ottaa vastaan juuri nyt"
          description="Tuotteita ei ole juuri nyt saatavilla ennakkovaraukseen. Kokeile hetken kuluttua uudelleen."
        />
      )}
    </main>
  );
}
