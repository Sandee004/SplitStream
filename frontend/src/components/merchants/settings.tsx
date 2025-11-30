{
  /*import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, User, Wallet, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMerchantStore } from '@/stores/merchantStore';
import { toast } from 'sonner';

const DashboardSettings = () => {
  const navigate = useNavigate();
  const alias = useMerchantStore((state) => state.alias);
  const walletAddress = useMerchantStore((state) => state.walletAddress);
  const setMerchant = useMerchantStore((state) => state.setMerchant);

  const [newAlias, setNewAlias] = useState(alias);
  const [newWallet, setNewWallet] = useState(walletAddress);

  useEffect(() => {
    if (!alias) navigate('/setup');
  }, [alias, navigate]);

  const handleSave = () => {
    if (newAlias.trim() && newWallet.trim()) {
      setMerchant(newAlias.trim(), newWallet.trim());
      toast.success('Settings updated successfully');
    }
  };

  const hasChanges = newAlias !== alias || newWallet !== walletAddress;

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">
        {/* Header /}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-sm font-mono text-muted-foreground mt-1">
            MERCHANT_CONFIG
          </p>
        </motion.div>

        {/* Profile Section /}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-2 border-border bg-card"
        >
          <div className="p-6 border-b border-border">
            <h2 className="font-semibold text-foreground">Origin Identity</h2>
            <p className="text-xs font-mono text-muted-foreground mt-1">
              Primary merchant configuration
            </p>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <User className="w-4 h-4" />
                Merchant Alias
              </label>
              <Input
                value={newAlias}
                onChange={(e) => setNewAlias(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Wallet className="w-4 h-4" />
                Default Payout Wallet
              </label>
              <Input
                variant="mono"
                value={newWallet}
                onChange={(e) => setNewWallet(e.target.value)}
              />
              <p className="text-xs font-mono text-muted-foreground">
                This wallet receives the owner's share of all revenue splits
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-border bg-secondary/30">
            <Button
              variant="accent"
              onClick={handleSave}
              disabled={!hasChanges}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </motion.div>

        {/* Danger Zone /}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="border-2 border-destructive/30 bg-card"
        >
          <div className="p-6 border-b border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h2 className="font-semibold text-foreground">Danger Zone</h2>
            </div>
          </div>
          
          <div className="p-6">
            <p className="text-sm text-muted-foreground mb-4">
              Clear all local data including merchant profile and product streams.
              This action cannot be undone.
            </p>
            <Button
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => {
                if (confirm('Are you sure you want to clear all data?')) {
                  localStorage.clear();
                  window.location.href = '/';
                }
              }}
            >
              Clear All Data
            </Button>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardSettings;
*/
}
