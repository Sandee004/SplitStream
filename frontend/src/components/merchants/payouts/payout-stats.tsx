import { useMemo } from "react";
import { TrendingUp, Users, Activity } from "lucide-react";
import type { Transaction } from "./types";

interface Props {
  payouts: Transaction[];
  activeCollaboratorsCount?: number; // NEW PROP
}

export default function PayoutStats({
  payouts = [],
  activeCollaboratorsCount,
}: Props) {
  const stats = useMemo(() => {
    // 1. Total Distributed (SETTLED)
    const totalDistributed = payouts
      .filter((p) => p.status === "SETTLED")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // 2. Pending Distributions (PENDING)
    const pendingAmount = payouts
      .filter((p) => p.status === "PENDING")
      .reduce((sum, p) => sum + Number(p.amount), 0);

    // 3. Active Collaborators
    // Logic: Use the prop if provided, otherwise fallback to calculating from history
    let activeCount = 0;
    if (activeCollaboratorsCount !== undefined) {
      activeCount = activeCollaboratorsCount;
    } else {
      activeCount = new Set(payouts.map((p) => p.wallet)).size;
    }

    return [
      {
        label: "TOTAL_DISTRIBUTED",
        value: totalDistributed.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        unit: "MNEE",
        icon: TrendingUp,
        color: "text-[#065f46]",
      },
      {
        label: "ACTIVE_COLLABORATORS",
        value: activeCount.toString(),
        unit: "PARTNERS",
        icon: Users,
        color: "text-[#065f46]",
      },
      {
        label: "PENDING_PAYOUTS",
        value: pendingAmount.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        unit: "MNEE",
        icon: Activity,
        color: pendingAmount > 0 ? "text-amber-600" : "text-[#065f46]",
      },
    ];
  }, [payouts, activeCollaboratorsCount]);

  return (
    <div className="pt:18 lg:pt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white border-2 border-[#065f46]/20 p-5 group hover:border-[#a3e635] transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-[#F2F6F4] border border-[#065f46]/10 group-hover:bg-[#a3e635]/10 transition-colors">
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <span className="text-[10px] font-mono bg-[#065f46]/5 text-[#065f46] px-2 py-1">
              {stat.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className={`text-3xl font-bold font-mono ${stat.color}`}>
              {stat.value}
            </span>
            <span className="text-xs font-bold text-[#065f46]/40">
              {stat.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
