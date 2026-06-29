import Link from "next/link";
import { deleteOrderAction, updateOrderStatusAction } from "@/lib/actions/orders";
import type { DetailedOrder, OrderStatus } from "@/lib/types";
import {
  formatDateTime,
  formatPickupDate,
  formatPhone,
  formatWeight
} from "@/lib/utils/format";
import { ConfirmSubmitButton } from "./confirm-submit-button";

const statusOptions: OrderStatus[] = ["uusi", "kasittelyssa", "valmis", "noudettu"];

type OrderCardProps = {
  order: DetailedOrder;
};

export function OrderCard({ order }: OrderCardProps) {
  return (
    <article className="panel order-panel">
      <div className="panel-header">
        <div>
          <p className="section-label">Asiakas</p>
          <h2>{order.customer_name}</h2>
          <p className="card-copy">{formatPhone(order.phone)}</p>
          {order.email ? <p className="card-copy">{order.email}</p> : null}
        </div>
        <span className={`status-pill ${order.status}`}>{order.status}</span>
      </div>

      <div className="order-meta">
        <span>Nouto {formatPickupDate(order.pickup_date)}</span>
        <span>Luotu {formatDateTime(order.created_at)}</span>
      </div>

      <div className="item-list">
        {order.order_items.map((item) => (
          <article className="item-row" key={item.id}>
            <strong>{item.product_name}</strong>
            <span>{formatWeight(item.quantity_grams)}</span>
          </article>
        ))}
      </div>

      {order.notes ? <p className="notes-box">{order.notes}</p> : null}

      <div className="action-grid">
        <Link
          className="ghost-button"
          href={`/tilaukset/${order.pickup_date}/${order.id}/muokkaa`}
        >
          Muokkaa
        </Link>
        <Link
          className="ghost-button"
          href={`/tilaukset/${order.pickup_date}/${order.id}/tarra?size=4x6`}
          target="_blank"
        >
          Tarra 4x6
        </Link>
        <Link
          className="ghost-button"
          href={`/tilaukset/${order.pickup_date}/${order.id}/tarra?size=4x3`}
          target="_blank"
        >
          Tarra 4x3
        </Link>
        <form action={deleteOrderAction}>
          <input name="orderId" type="hidden" value={order.id} />
          <input name="pickupDate" type="hidden" value={order.pickup_date} />
          <ConfirmSubmitButton
            className="danger-button"
            message="Poistetaanko tilaus varmasti?"
          >
            Poista
          </ConfirmSubmitButton>
        </form>
      </div>

      <div className="status-grid">
        {statusOptions.map((status) => (
          <form action={updateOrderStatusAction} key={status}>
            <input name="orderId" type="hidden" value={order.id} />
            <input name="pickupDate" type="hidden" value={order.pickup_date} />
            <input name="status" type="hidden" value={status} />
            <button
              className={`status-button ${order.status === status ? "active" : ""}`}
              type="submit"
            >
              {status}
            </button>
          </form>
        ))}
      </div>
    </article>
  );
}
