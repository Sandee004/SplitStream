import { Pencil, Trash2, Users, DollarSign } from "lucide-react";

interface Split {
  id: string;
  wallet: string;
  percentage: number;
  isOwner?: boolean;
}

interface Product {
  id: string;
  name: string;
  price: number;
  splits: Split[];
}

interface ActiveStreamsProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
}

export default function ActiveStreams({
  products,
  onEdit,
  onDelete,
}: ActiveStreamsProps) {
  if (!products || products.length === 0) return null;

  return (
    <div className="bg-white border-2 border-[#1a3a2a]/20">
      {/* Header */}
      <div className="px-6 py-4 border-b border-[#1a3a2a]/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#a8e6cf] animate-pulse" />
          <h3 className="font-semibold text-[#1a3a2a]">Active Streams</h3>
        </div>
        <span className="font-mono text-xs text-[#1a3a2a]/50">
          {products.length} DEPLOYED
        </span>
      </div>

      {/* Stream Cards Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="border-2 border-[#1a3a2a]/20 bg-[#f5f5f5]/30 relative group hover:border-[#1a3a2a]/40 transition-colors"
          >
            {/* Corner accent */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#a8e6cf]" />

            <div className="p-4">
              {/* Product Name */}
              <h4 className="font-semibold text-[#1a3a2a] text-lg truncate">
                {product.name}
              </h4>

              {/* Price */}
              <div className="flex items-center gap-2 mt-2">
                <DollarSign className="w-4 h-4 text-[#1a3a2a]/50" />
                <span className="font-mono text-lg text-[#1a3a2a] tabular-nums">
                  {product.price.toFixed(2)}
                </span>
                <span className="font-mono text-xs text-[#1a3a2a]/50">
                  MNEE
                </span>
              </div>

              {/* Split Info */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#1a3a2a]/10">
                <Users className="w-4 h-4 text-[#1a3a2a]/50" />
                <span className="text-sm text-[#1a3a2a]/70">
                  {product.splits.length} recipient
                  {product.splits.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Split Visualization */}
              <div className="mt-3 h-2 bg-[#1a3a2a]/10 flex overflow-hidden">
                {product.splits.map((split, idx) => (
                  <div
                    key={split.id}
                    style={{ width: `${split.percentage}%` }}
                    className={`h-full ${
                      split.isOwner
                        ? "bg-[#1a3a2a]"
                        : idx % 2 === 0
                        ? "bg-[#a8e6cf]"
                        : "bg-[#70c49b]"
                    }`}
                  />
                ))}
              </div>

              {/* Split labels */}
              <div className="mt-2 space-y-1">
                {product.splits.slice(0, 3).map((split) => (
                  <div
                    key={split.id}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="font-mono text-[#1a3a2a]/60 truncate max-w-[60%]">
                      {split.isOwner
                        ? "You"
                        : `${split.wallet.slice(0, 6)}...${split.wallet.slice(
                            -4
                          )}`}
                    </span>
                    <span className="font-mono text-[#1a3a2a] font-semibold">
                      {split.percentage}%
                    </span>
                  </div>
                ))}
                {product.splits.length > 3 && (
                  <span className="text-xs text-[#1a3a2a]/40 font-mono">
                    +{product.splits.length - 3} more
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex border-t-2 border-[#1a3a2a]/20">
              <button
                onClick={() => onEdit(product)}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-[#1a3a2a]/70 hover:text-[#1a3a2a] hover:bg-[#a8e6cf]/10 transition-colors border-r border-[#1a3a2a]/20"
              >
                <Pencil className="w-4 h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
              <button
                onClick={() => onDelete(product.id)}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-[#e53e3e]/70 hover:text-[#e53e3e] hover:bg-[#e53e3e]/5 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
