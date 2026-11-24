import React from "react";
import { Text, View } from "react-native";

export type ParentFinanceFee = {
  id: string;
  title: string;
  currency: string;
  amount: string | number;
  amountPaid: string | number;
  dueAt?: string | null;
  status: string;
};

function money(value: string | number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function formatAmount(currency: string, amount: number): string {
  return `${currency} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}


/** Parent-only read summary. Payment initiation is intentionally not represented as available. */
export function ParentFinanceSummary({ fees }: { fees: ParentFinanceFee[] }) {
  const totals = fees.reduce<Record<string, { billed: number; paid: number; outstanding: number; overdue: number; count: number }>>((acc, fee) => {
    const currency = (fee.currency || "INR").toUpperCase();
    const amount = money(fee.amount);
    const paid = Math.min(amount, money(fee.amountPaid));
    const outstanding = Math.max(0, amount - paid);
    const bucket = acc[currency] || (acc[currency] = { billed: 0, paid: 0, outstanding: 0, overdue: 0, count: 0 });
    bucket.count += 1;
    bucket.billed += amount;
    bucket.paid += paid;
    bucket.outstanding += outstanding;
    if (outstanding > 0 && fee.dueAt && Date.parse(`${fee.dueAt.slice(0, 10)}T23:59:59`) < Date.now()) bucket.overdue += outstanding;
    return acc;
  }, {});

  return <View accessibilityLabel="Fee summary" style={{ gap: 8, marginBottom: 12 }}>
    <Text style={{ fontWeight: "700", fontSize: 16 }}>Fee summary</Text>
    {fees.length === 0 ? <Text style={{ color: "#667085" }}>Summary will appear when fee statements are published.</Text> : Object.entries(totals).map(([currency, total]) => <View key={currency} style={{ borderWidth: 1, borderColor: "#d0d5dd", borderRadius: 10, padding: 12, gap: 4 }}>
      <Text style={{ fontWeight: "700" }}>{currency} · {total.count} fee statement{total.count === 1 ? "" : "s"}</Text>
      <Text>Billed: {formatAmount(currency, total.billed)}</Text>
      <Text>Paid: {formatAmount(currency, total.paid)}</Text>
      <Text style={{ fontWeight: "700" }}>Outstanding: {formatAmount(currency, total.outstanding)}</Text>
      {total.overdue > 0 ? <Text style={{ color: "#b42318" }}>Overdue: {formatAmount(currency, total.overdue)}</Text> : <Text style={{ color: "#027a48" }}>No overdue amount detected in published statements</Text>}
    </View>)}
    <Text style={{ color: "#667085", fontSize: 12 }}>Read-only summary. Payments are not initiated from this screen; payment gateway availability is not confirmed.</Text>
  </View>;
}
