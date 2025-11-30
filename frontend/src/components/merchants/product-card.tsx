import { motion } from "framer-motion";
import { Edit2, Users, Trash2 } from "lucide-react";

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
  description?: string;
  splits: Split[]; // must exist
}

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  index: number;
}

const ProductCard = ({
  product,
  onEdit,
  onDelete,
  index,
}: ProductCardProps) => {
  const totalCollaborators = product.splits.filter((s) => !s.isOwner).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="border-2 border-border bg-card card-hover p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h4 className="font-semibold text-foreground">{product.name}</h4>
          <p className="font-mono text-lg font-bold text-accent mt-1">
            {product.price.toLocaleString()} MNEE
          </p>
        </div>
        <div className="flex gap-1">
          <button
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(product)}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(product.id)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Split visualization */}
      <div className="mb-4">
        <div className="flex h-2 rounded-sm overflow-hidden bg-muted">
          {product.splits.map((split, i) => (
            <div
              key={split.id}
              className="h-full transition-all"
              style={{
                width: `${split.percentage}%`,
                backgroundColor: split.isOwner
                  ? "hsl(var(--accent))"
                  : `hsl(160, ${60 - i * 15}%, ${35 + i * 10}%)`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>
            {totalCollaborators > 0
              ? `${totalCollaborators} collaborator${
                  totalCollaborators > 1 ? "s" : ""
                }`
              : "Solo stream"}
          </span>
        </div>
        <span className="font-mono text-muted-foreground">
          {product.splits.length} split{product.splits.length > 1 ? "s" : ""}
        </span>
      </div>
    </motion.div>
  );
};

export default ProductCard;
