export const STATUSES = ["received", "sorting", "washing", "drying", "folding", "ready_for_pickup", "picked_up"];

export const STATUS_LABEL = {
  received: "Received", sorting: "Sorting", washing: "Washing", drying: "Drying",
  folding: "Folding", ready_for_pickup: "Ready for pickup", picked_up: "Picked up",
};

export function statusTone(status) {
  if (status === "picked_up") return "green";
  if (status === "ready_for_pickup") return "coral";
  if (status === "received") return "amber";
  return "cyan";
}

export function peso(n) {
  return "\u20B1" + Number(n || 0).toLocaleString("en-PH", { maximumFractionDigits: 0 });
}

export function fmtDate(d) {
  return new Date(d).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

export function fmtDateTime(d) {
  return new Date(d).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
