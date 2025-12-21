{
  /*import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowLeft, Store } from "lucide-react";

const Storefront = () => {
  const { merchantId } = useParams();

  // In a real app, we'd fetch merchant data by merchantId
  // For now, we use the local store
  const merchantName = "Anonymous Merchant";
  interface Product {
    id: string;
    name: string;
    price: number;
    description?: string;
  }

  const merchantProducts: Product[] = [];

  return (
    <div className="min-h-screen bg-background grid-pattern">
      {/* Header /}
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded border-2 border-border flex items-center justify-center bg-secondary">
                <Store className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground tracking-tight">
                  {merchantName}
                </h1>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                  <span className="text-xs text-muted-foreground font-mono">
                    VERIFIED STREAM
                  </span>
                </div>
              </div>
            </div>
            <div className="w-16" /> {/* Spacer for alignment *}
          </div>
        </div>
      </header>

      {/* Main Content *}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Title Section /}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <p className="text-sm font-mono text-muted-foreground mb-2">
            MERCHANT_ID: {merchantId || "local"}
          </p>
          <h2 className="text-3xl font-bold text-foreground tracking-tight mb-2">
            Available Streams
          </h2>
          <p className="text-muted-foreground">
            Select a product to initialize programmable payment
          </p>
        </motion.div>

        {/* Products Grid /}
        {merchantProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {merchantProducts.map((product) => (
              <div
                key={product.id}
                //product={product}
                //index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 border-2 border-dashed border-border"
          >
            <Store className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No Active Streams
            </h3>
            <p className="text-muted-foreground text-sm">
              This merchant hasn't deployed any revenue streams yet.
            </p>
          </motion.div>
        )}

        {/* Footer Info /}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 border border-border bg-secondary/50 text-xs text-muted-foreground font-mono">
            <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
            SPLITSTREAM PROTOCOL v1.0
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Storefront;




const bytes = CryptoJS.AES.decrypt(encryptedPrivateKey, "my-temporary-secret-key");
const originalKey = bytes.toString(CryptoJS.enc.Utf8);
*/
}
