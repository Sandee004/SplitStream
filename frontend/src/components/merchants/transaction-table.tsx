import { useNavigate } from "react-router-dom";
import { Clock, ExternalLink } from "lucide-react";

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-8)}`;
}

interface Transaction {
  id: string;
  txHash: string;
  productName: string;
  amount: number;
  timestamp: Date;
}

export default function TransactionTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const navigate = useNavigate();

  const goToTx = (hash: string) => {
    navigate(`/tx/${hash}`);
  };

  return (
    <div className="bg-white border-2 border-[#065f46]/20">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#065f46]/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#065f46]/60" />
          <h3 className="font-semibold text-[#065f46]">Recent Inflow Events</h3>
        </div>
        <span className="text-xs font-mono text-[#065f46]/50 px-2 py-1 bg-[#F2F6F4] border border-[#065f46]/10">
          LIVE_FEED
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#065f46]/10 bg-[#F2F6F4]/50">
              <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-[#065f46]/50">
                TX Hash
              </th>
              <th className="px-6 py-3 text-left text-xs font-mono uppercase tracking-wider text-[#065f46]/50">
                Product
              </th>
              <th className="px-6 py-3 text-right text-xs font-mono uppercase tracking-wider text-[#065f46]/50">
                Amount Split
              </th>
              <th className="px-6 py-3 text-right text-xs font-mono uppercase tracking-wider text-[#065f46]/50">
                Time
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#065f46]/5">
            {transactions.map((tx) => (
              <tr
                key={tx.id}
                className="hover:bg-[#a3e635]/5 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-[#065f46]">
                      {truncateHash(tx.txHash)}
                    </span>

                    <ExternalLink
                      className="w-3 h-3 text-[#065f46]/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        goToTx(tx.txHash);
                      }}
                    />
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span className="text-sm text-[#065f46]">
                    {tx.productName}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <span className="font-mono text-sm text-[#065f46] tabular-nums">
                    {tx.amount.toFixed(2)}{" "}
                    <span className="text-[#065f46]/50">MNEE</span>
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <span className="font-mono text-xs text-[#065f46]/50">
                    {formatTimeAgo(tx.timestamp)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-[#065f46]/10 bg-[#F2F6F4]/30">
        <p className="text-xs text-[#065f46]/40 font-mono text-center">
          Showing {transactions.length} most recent transactions
        </p>
      </div>
    </div>
  );
}
