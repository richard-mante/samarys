"use client";

import { useActionState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle02Icon } from "@hugeicons/core-free-icons";
import { updateOrderStatus } from "./actions";

type OrderStatus = "PENDING_PAYMENT" | "CONFIRMED" | "PROCESSING" | "FULFILLED" | "CANCELLED";

const labels: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "Awaiting payment",
  CONFIRMED: "Confirmed",
  PROCESSING: "Processing",
  FULFILLED: "Fulfilled",
  CANCELLED: "Cancelled",
};

const nextSteps: Record<OrderStatus, OrderStatus[]> = {
  PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["FULFILLED", "CANCELLED"],
  FULFILLED: [],
  CANCELLED: [],
};

export function OrderStatusForm({ orderId, status, paymentStatus }: { orderId: string; status: OrderStatus; paymentStatus: string }) {
  const update = updateOrderStatus.bind(null, orderId);
  const [state, action, pending] = useActionState(update, {});
  const options = nextSteps[status].filter((next) => next !== "FULFILLED" || paymentStatus === "PAID");

  if (options.length === 0) {
    return <div className="rounded-xl bg-[#f5f7f3] p-4">
      <p className="text-sm font-medium text-[#405447]">{status === "FULFILLED" ? "This order has been fulfilled." : status === "CANCELLED" ? "This order has been cancelled." : "No further status changes are available."}</p>
    </div>;
  }

  return <form action={action} className="space-y-4">
    <div>
      <label htmlFor="status" className="mb-2 block text-sm font-medium text-[#304236]">Move order to</label>
      <select id="status" name="status" defaultValue={options[0]} className="w-full rounded-xl border border-[#dfe5dc] bg-white px-4 py-3 text-sm outline-none focus:border-[#66836c] focus:ring-2 focus:ring-[#dce5d8]">
        {options.map((option) => <option key={option} value={option}>{labels[option]}</option>)}
      </select>
    </div>
    {state.error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{state.error}</p>}
    {state.success && <p role="status" className="rounded-xl bg-[#eef5ed] p-3 text-sm text-[#315b3b]">{state.success}</p>}
    <button disabled={pending} className="w-full rounded-full bg-[#244b36] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#183a28] disabled:opacity-60">{pending ? "Updating…" : <><HugeiconsIcon icon={CheckmarkCircle02Icon} size={17} className="mr-2 inline" />Update order status</>}</button>
    {paymentStatus !== "PAID" && <p className="text-xs leading-5 text-[#849087]">Fulfilment is locked until payment has been recorded as paid.</p>}
  </form>;
}
