import { X, Lock } from "lucide-react";

interface Split {
  id: string;
  wallet_address: string;
  percentage: number;
  isOwner?: boolean;
}

interface SplitInputRowProps {
  split: Split;
  index: number;
  onUpdate: (updates: Partial<Split>) => void;
  onRemove: () => void;
  canRemove: boolean;
}

export default function SplitInputRow({
  split,
  index,
  onUpdate,
  onRemove,
  canRemove,
}: SplitInputRowProps) {
  const handlePercentageChange = (value: string) => {
    const num = Number.parseInt(value) || 0;
    const clamped = Math.min(100, Math.max(0, num));
    onUpdate({ percentage: clamped });
  };

  return (
    <div
      className={`relative border-2 ${
        split.isOwner
          ? "border-[#1a3a2a] bg-[#f5f5f5]/5"
          : "border-[#1a3a2a]/20 bg-[#f5f5f5]/50"
      } p-4`}
    >
      {/* Row indicator */}
      <div
        className="absolute top-0 bottom-0 w-1 bg-[#a8e6cf]"
        style={{ left: "-2px" }}
      />

      <div className="flex items-start gap-4">
        {/* Row number/label */}
        <div className="flex-shrink-0 w-16">
          <span className="font-mono text-xs text-[#1a3a2a]/50 uppercase">
            {split.isOwner ? "Owner" : `Split ${index}`}
          </span>
        </div>

        {/* Wallet input */}
        <div className="flex-1 min-w-0">
          <label className="block text-xs font-medium text-[#1a3a2a]/60 mb-1">
            Wallet Address
          </label>
          {split.isOwner ? (
            <div className="flex items-center gap-2 px-3 py-2 bg-[#1a3a2a]/10 border border-[#1a3a2a]/20">
              <Lock className="w-3 h-3 text-[#1a3a2a]/50" />
              <span className="font-mono text-sm text-[#1a3a2a] truncate">
                {split.wallet_address}
              </span>
            </div>
          ) : (
            <input
              type="text"
              value={split.wallet_address}
              onChange={(e) => onUpdate({ wallet_address: e.target.value })}
              placeholder="0x..."
              className="w-full px-3 py-2 bg-white border border-[#1a3a2a]/20 focus:border-[#1a3a2a] focus:outline-none transition-colors font-mono text-sm text-[#1a3a2a] placeholder:text-[#1a3a2a]/30"
            />
          )}
        </div>

        {/* Percentage input */}
        <div className="flex-shrink-0 w-28">
          <label className="block text-xs font-medium text-[#1a3a2a]/60 mb-1">
            Share %
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              value={split.percentage}
              onChange={(e) => handlePercentageChange(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#1a3a2a]/20 focus:border-[#1a3a2a] focus:outline-none transition-colors font-mono text-sm text-[#1a3a2a] text-right pr-8"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1a3a2a]/50 font-mono text-sm">
              %
            </span>
          </div>
        </div>

        {/* Remove button */}
        <div className="flex-shrink-0 pt-5">
          {canRemove ? (
            <button
              type="button"
              onClick={onRemove}
              className="p-2 text-[#1a3a2a]/40 hover:text-[#e53e3e] hover:bg-[#ffeaea]/10 transition-colors border border-transparent hover:border-[#e53e3e]/20"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="p-2 w-8" />
          )}
        </div>
      </div>

      {/* Individual progress bar */}
      <div className="mt-3 h-1 bg-[#1a3a2a]/10">
        <div
          style={{ width: `${split.percentage}%` }}
          className={`h-full transition-all duration-300 ${
            split.isOwner ? "bg-[#1a3a2a]" : "bg-[#a8e6cf]"
          }`}
        />
      </div>
    </div>
  );
}
