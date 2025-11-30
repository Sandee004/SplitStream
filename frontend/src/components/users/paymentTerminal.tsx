{
  /*import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Wallet, 
  ArrowRight, 
  CheckCircle2, 
  Loader2, 
  Copy, 
  ExternalLink,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useMerchantStore } from '@/stores/merchantStore';
import { useToast } from '@/hooks/use-toast';

type TerminalState = 'disconnected' | 'connecting' | 'connected' | 'processing' | 'success';

const PaymentTerminal = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { products, alias, walletAddress } = useMerchantStore();

  const [terminalState, setTerminalState] = useState<TerminalState>('disconnected');
  const [userWallet, setUserWallet] = useState<string>('');

  const product = products.find(p => p.id === productId);

  // Generate fake wallet address
  const generateFakeWallet = () => {
    const chars = '0123456789abcdef';
    let wallet = '0x';
    for (let i = 0; i < 40; i++) {
      wallet += chars[Math.floor(Math.random() * chars.length)];
    }
    return wallet;
  };

  // Generate fake TX hash
  const generateTxHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const [txHash] = useState(generateTxHash());

  const handleConnect = () => {
    setTerminalState('connecting');
    setTimeout(() => {
      setUserWallet(generateFakeWallet());
      setTerminalState('connected');
      toast({
        title: 'Wallet Connected',
        description: 'Web3 wallet successfully linked to terminal.',
      });
    }, 1000);
  };

  const handleExecute = () => {
    setTerminalState('processing');
    setTimeout(() => {
      setTerminalState('success');
    }, 2000);
  };

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Transaction hash copied to clipboard.',
    });
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-background grid-pattern flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Stream Not Found</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background grid-pattern flex items-center justify-center p-6">
      {/* Back Button /}
      <Link
        to={`/store/${alias || 'merchant'}`}
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to Store</span>
      </Link>

      {/* Terminal Card /}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl"
      >
        <AnimatePresence mode="wait">
          {terminalState !== 'success' ? (
            <motion.div
              key="payment"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.3 }}
              className="border-2 border-border bg-card overflow-hidden"
            >
              {/* Terminal Header /}
              <div className="border-b border-border px-6 py-4 bg-secondary/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
                    <span className="text-xs font-mono text-muted-foreground">
                      PAYMENT_TERMINAL
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-accent" />
                    <span className="text-xs font-mono text-muted-foreground">
                      SECURE
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 lg:p-8">
                <div className="grid lg:grid-cols-2 gap-8">
                  {/* Left Side - Product Details /}
                  <div className="space-y-6">
                    <div>
                      <p className="text-xs font-mono text-muted-foreground mb-2">
                        STREAM_NAME
                      </p>
                      <h1 className="text-2xl font-bold text-foreground tracking-tight">
                        {product.name}
                      </h1>
                    </div>

                    <div>
                      <p className="text-xs font-mono text-muted-foreground mb-2">
                        MERCHANT
                      </p>
                      <p className="text-foreground">{alias || 'Anonymous'}</p>
                    </div>

                    {/* Payment Route Visualization /}
                    <div>
                      <p className="text-xs font-mono text-muted-foreground mb-3">
                        PAYMENT_ROUTE
                      </p>
                      <div className="flex items-center gap-2 text-sm">
                        <div className="flex items-center gap-2 px-3 py-2 border border-border bg-secondary/50">
                          <Wallet className="w-4 h-4 text-muted-foreground" />
                          <span className="font-mono text-xs">
                            {userWallet ? truncateAddress(userWallet) : 'YOUR_WALLET'}
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-accent" />
                        <div className="flex items-center gap-2 px-3 py-2 border border-accent bg-accent/10">
                          <span className="font-mono text-xs text-accent">
                            SPLITSTREAM
                          </span>
                        </div>
                        <ArrowRight className="w-4 h-4 text-accent" />
                        <div className="flex items-center gap-2 px-3 py-2 border border-border bg-secondary/50">
                          <span className="font-mono text-xs">
                            {product.splits.length} {product.splits.length === 1 ? 'RECIPIENT' : 'RECIPIENTS'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Split Breakdown /}
                    <div>
                      <p className="text-xs font-mono text-muted-foreground mb-3">
                        SPLIT_DISTRIBUTION
                      </p>
                      <div className="space-y-2">
                        {product.splits.map((split, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between text-sm py-2 border-b border-border last:border-0"
                          >
                            <span className="font-mono text-xs text-muted-foreground">
                              {truncateAddress(split.walletAddress)}
                            </span>
                            <span className="font-mono text-foreground font-semibold">
                              {split.percentage}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Action Area /}
                  <div className="flex flex-col justify-center space-y-6">
                    {/* Price Display /}
                    <div className="text-center lg:text-left">
                      <p className="text-xs font-mono text-muted-foreground mb-2">
                        TOTAL_AMOUNT
                      </p>
                      <p className="text-5xl lg:text-6xl font-mono font-bold text-foreground tracking-tighter">
                        {product.price.toFixed(2)}
                      </p>
                      <p className="text-lg font-mono text-muted-foreground mt-1">
                        MNEE
                      </p>
                    </div>

                    {/* Wallet Status /}
                    {terminalState === 'connected' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 px-4 py-3 border border-accent bg-accent/10"
                      >
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                        <span className="text-xs font-mono text-foreground">
                          Connected: {truncateAddress(userWallet)}
                        </span>
                      </motion.div>
                    )}

                    {/* Action Buttons /}
                    <div className="space-y-3">
                      {terminalState === 'disconnected' && (
                        <Button
                          variant="accent"
                          size="xl"
                          className="w-full"
                          onClick={handleConnect}
                        >
                          <Wallet className="w-5 h-5 mr-2" />
                          Connect Web3 Wallet
                        </Button>
                      )}

                      {terminalState === 'connecting' && (
                        <Button
                          variant="accent"
                          size="xl"
                          className="w-full"
                          disabled
                        >
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Connecting...
                        </Button>
                      )}

                      {terminalState === 'connected' && (
                        <Button
                          variant="hero"
                          size="xl"
                          className="w-full"
                          onClick={handleExecute}
                        >
                          Execute Transfer ({product.price.toFixed(2)} MNEE)
                        </Button>
                      )}

                      {terminalState === 'processing' && (
                        <Button
                          variant="hero"
                          size="xl"
                          className="w-full"
                          disabled
                        >
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processing Block...
                        </Button>
                      )}
                    </div>

                    <p className="text-xs text-center text-muted-foreground">
                      Secured by SplitStream Protocol
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Success/Receipt View /
            <motion.div
              key="receipt"
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              transition={{ duration: 0.3 }}
              className="border-2 border-accent bg-card overflow-hidden"
            >
              {/* Receipt Header /}
              <div className="border-b border-accent px-6 py-4 bg-accent/10">
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent" />
                  <span className="text-sm font-mono text-accent font-semibold">
                    TRANSFER_COMPLETE
                  </span>
                </div>
              </div>

              <div className="p-6 lg:p-8 text-center space-y-8">
                {/* Success Icon /}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="w-20 h-20 mx-auto border-2 border-accent bg-accent/10 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-accent" />
                </motion.div>

                {/* Amount /}
                <div>
                  <p className="text-xs font-mono text-muted-foreground mb-2">
                    AMOUNT_TRANSFERRED
                  </p>
                  <p className="text-4xl font-mono font-bold text-foreground">
                    {product.price.toFixed(2)} MNEE
                  </p>
                </div>

                {/* Transaction Hash /}
                <div className="border border-border p-4 bg-secondary/30">
                  <p className="text-xs font-mono text-muted-foreground mb-2">
                    TX_HASH
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-xs font-mono text-foreground break-all">
                      {txHash}
                    </code>
                    <button
                      onClick={() => copyToClipboard(txHash)}
                      className="p-1 hover:bg-secondary rounded transition-colors"
                    >
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Details /}
                <div className="grid grid-cols-2 gap-4 text-left">
                  <div className="border border-border p-3">
                    <p className="text-xs font-mono text-muted-foreground mb-1">
                      FROM
                    </p>
                    <p className="text-sm font-mono text-foreground">
                      {truncateAddress(userWallet)}
                    </p>
                  </div>
                  <div className="border border-border p-3">
                    <p className="text-xs font-mono text-muted-foreground mb-1">
                      PRODUCT
                    </p>
                    <p className="text-sm text-foreground">
                      {product.name}
                    </p>
                  </div>
                  <div className="border border-border p-3">
                    <p className="text-xs font-mono text-muted-foreground mb-1">
                      SPLITS_EXECUTED
                    </p>
                    <p className="text-sm font-mono text-foreground">
                      {product.splits.length}
                    </p>
                  </div>
                  <div className="border border-border p-3">
                    <p className="text-xs font-mono text-muted-foreground mb-1">
                      STATUS
                    </p>
                    <p className="text-sm font-mono text-accent font-semibold">
                      CONFIRMED
                    </p>
                  </div>
                </div>

                {/* Actions /}
                <div className="space-y-3">
                  <Button
                    variant="accent"
                    size="lg"
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Access Content
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full"
                    onClick={() => navigate(`/store/${alias || 'merchant'}`)}
                  >
                    Return to Store
                  </Button>
                </div>

                {/* Receipt Footer /}
                <div className="pt-4 border-t border-border">
                  <p className="text-xs font-mono text-muted-foreground">
                    Powered by SplitStream Protocol v1.0
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default PaymentTerminal;
*/
}
