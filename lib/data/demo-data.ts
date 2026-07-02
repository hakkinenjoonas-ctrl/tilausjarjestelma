import type { DailyFeaturedProduct, DetailedOrder, Product } from "@/lib/types";

function getTodayDateString() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Helsinki"
  }).format(new Date());
}

function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Helsinki"
  }).format(tomorrow);
}

export const demoProducts: Product[] = [
  "Savumerilohi",
  "Savukirjolohi",
  "Graavimerilohi",
  "Graavikirjolohi",
  "Graavisiika",
  "Tuore merilohifilee",
  "Tuore kirjolohifilee",
  "Tuore kokonainen kirjolohi",
  "Kuhafilee",
  "Haukifilee",
  "Perattu muikku"
].map((name, index) => ({
  id: `demo-product-${index + 1}`,
  name,
  active: true,
  sort_order: index + 1,
  created_at: new Date().toISOString()
}));

export const demoOrders: DetailedOrder[] = [
  {
    id: "demo-order-1",
    pickup_date: "2026-12-24",
    customer_name: "Matti Meikalainen",
    phone: "040 123 4567",
    email: "matti@example.com",
    notes: "Nouto klo 14 jalkeen",
    status: "uusi",
    created_at: "2026-12-20T09:15:00.000Z",
    updated_at: "2026-12-20T09:15:00.000Z",
    order_items: [
      {
        id: "demo-item-1",
        order_id: "demo-order-1",
        product_id: "demo-product-1",
        product_name: "Savumerilohi",
        quantity_grams: 1200
      },
      {
        id: "demo-item-2",
        order_id: "demo-order-1",
        product_id: "demo-product-3",
        product_name: "Graavimerilohi",
        quantity_grams: 800
      }
    ]
  },
  {
    id: "demo-order-2",
    pickup_date: "2026-12-24",
    customer_name: "Kahvila Satama",
    phone: "050 555 0001",
    email: "tilaukset@kahvilasatama.fi",
    notes: null,
    status: "kasittelyssa",
    created_at: "2026-12-20T11:00:00.000Z",
    updated_at: "2026-12-20T11:30:00.000Z",
    order_items: [
      {
        id: "demo-item-3",
        order_id: "demo-order-2",
        product_id: "demo-product-6",
        product_name: "Tuore merilohifilee",
        quantity_grams: 3000
      }
    ]
  },
  {
    id: "demo-order-3",
    pickup_date: "2026-12-23",
    customer_name: "Laura Niemi",
    phone: "045 777 2211",
    email: null,
    notes: "Pakataan kahteen osaan",
    status: "valmis",
    created_at: "2026-12-19T13:40:00.000Z",
    updated_at: "2026-12-21T08:00:00.000Z",
    order_items: [
      {
        id: "demo-item-4",
        order_id: "demo-order-3",
        product_id: "demo-product-11",
        product_name: "Perattu muikku",
        quantity_grams: 1500
      }
    ]
  }
];

export const demoDailyFeaturedProduct: DailyFeaturedProduct = {
  id: "default",
  product_name: "Päivän siikafilee",
  price: "29,90 €/kg",
  fishing_area: "Pihlajavesi",
  visible_from: getTodayDateString(),
  visible_to: getTomorrowDateString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
