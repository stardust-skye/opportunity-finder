const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatHourlyPay(cents) {
  return cents == null ? "Pay not specified" : `${formatter.format(cents / 100)} / hour`;
}
