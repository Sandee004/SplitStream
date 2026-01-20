import { TrendingUp, Users, Activity } from "lucide-react";

const STATS_DATA = [
  {
    label: "TOTAL_DISTRIBUTED",
    value: "4,250.00",
    unit: "MNEE",
    icon: TrendingUp,
  },
  { label: "ACTIVE_COLLABORATORS", value: "8", unit: "NODES", icon: Users },
  { label: "PROTOCOL_UPTIME", value: "99.9%", unit: "HEALTH", icon: Activity },
];

export default function PayoutStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {STATS_DATA.map((stat, idx) => (
        <div
          key={idx}
          className="bg-white border-2 border-[#065f46]/20 p-5 group hover:border-[#a3e635] transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-2 bg-[#F2F6F4] border border-[#065f46]/10 group-hover:bg-[#a3e635]/10 transition-colors">
              <stat.icon className="w-5 h-5 text-[#065f46]" />
            </div>
            <span className="text-[10px] font-mono bg-[#065f46]/5 text-[#065f46] px-2 py-1">
              {stat.label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold font-mono text-[#065f46]">
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
