{
  /*import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ArrowRight, ArrowLeft, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMerchantStore, Product, Split } from '@/stores/merchantStore';
import SplitInputRow from './SplitInputRow';
import SplitVisualizer from './SplitVisualizer';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  editProduct?: Product | null;
}

const AddProductModal = ({ isOpen, onClose, editProduct }: AddProductModalProps) => {
  const walletAddress = useMerchantStore((state) => state.walletAddress);
  const addProduct = useMerchantStore((state) => state.addProduct);
  const updateProduct = useMerchantStore((state) => state.updateProduct);

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [splits, setSplits] = useState<Split[]>([]);

  // Initialize/reset form
  useEffect(() => {
    if (isOpen) {
      if (editProduct) {
        setName(editProduct.name);
        setPrice(editProduct.price.toString());
        setSplits(editProduct.splits);
        setStep(1);
      } else {
        setName('');
        setPrice('');
        setSplits([
          {
            id: 'owner',
            walletAddress,
            percentage: 100,
            isOwner: true,
          },
        ]);
        setStep(1);
      }
    }
  }, [isOpen, editProduct, walletAddress]);

  const handleAddCollaborator = () => {
    const ownerSplit = splits.find((s) => s.isOwner);
    if (!ownerSplit || ownerSplit.percentage < 10) return;

    const newPercentage = 10;
    const newOwnerPercentage = ownerSplit.percentage - newPercentage;

    setSplits([
      { ...ownerSplit, percentage: newOwnerPercentage },
      ...splits.filter((s) => !s.isOwner),
      {
        id: `collab-${Date.now()}`,
        walletAddress: '',
        percentage: newPercentage,
      },
    ]);
  };

  const handleRemoveCollaborator = (id: string) => {
    const splitToRemove = splits.find((s) => s.id === id);
    if (!splitToRemove) return;

    const ownerSplit = splits.find((s) => s.isOwner);
    if (!ownerSplit) return;

    setSplits([
      { ...ownerSplit, percentage: ownerSplit.percentage + splitToRemove.percentage },
      ...splits.filter((s) => s.id !== id && !s.isOwner),
    ]);
  };

  const handlePercentageChange = (id: string, newPercentage: number) => {
    const currentSplit = splits.find((s) => s.id === id);
    if (!currentSplit) return;

    const diff = newPercentage - currentSplit.percentage;
    const ownerSplit = splits.find((s) => s.isOwner);
    if (!ownerSplit) return;

    const newOwnerPercentage = ownerSplit.percentage - diff;
    if (newOwnerPercentage < 0 || newOwnerPercentage > 100) return;

    setSplits(
      splits.map((s) => {
        if (s.id === id) return { ...s, percentage: newPercentage };
        if (s.isOwner) return { ...s, percentage: newOwnerPercentage };
        return s;
      })
    );
  };

  const handleWalletChange = (id: string, wallet: string) => {
    setSplits(
      splits.map((s) => (s.id === id ? { ...s, walletAddress: wallet } : s))
    );
  };

  const totalPercentage = splits.reduce((sum, s) => sum + s.percentage, 0);
  const isStep1Valid = name.trim().length > 0 && Number(price) > 0;
  const isStep2Valid = totalPercentage === 100 && splits.every((s) => s.walletAddress.trim().length > 0);

  const handleSubmit = () => {
    if (!isStep2Valid) return;

    const productData = {
      name: name.trim(),
      price: Number(price),
      splits,
    };

    if (editProduct) {
      updateProduct(editProduct.id, productData);
    } else {
      addProduct(productData);
    }

    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop /}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 z-50"
            onClick={onClose}
          />

          {/* Modal /}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-lg bg-card border-2 border-border-strong z-50 flex flex-col max-h-[90vh]"
          >
            {/* Header /}
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <div className="font-mono text-xs text-muted-foreground mb-1">
                  STEP {step.toString().padStart(2, '0')} / 02
                </div>
                <h2 className="text-lg font-bold text-foreground">
                  {editProduct ? 'Edit Revenue Stream' : 'Initialize New Revenue Stream'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content /}
            <div className="flex-1 overflow-y-auto p-6">
              {step === 1 ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-4">Stream Basics</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Stream Name
                        </label>
                        <Input
                          placeholder="e.g., AI Art Pack"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Total Price (MNEE)
                        </label>
                        <Input
                          type="number"
                          variant="mono"
                          placeholder="100"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-1">Programmable Splits</h3>
                    <p className="text-xs text-muted-foreground mb-4">
                      Define how revenue is distributed among collaborators.
                    </p>

                    {/* Split rows /}
                    <div className="space-y-3 mb-4">
                      {splits.map((split) => (
                        <SplitInputRow
                          key={split.id}
                          walletAddress={split.walletAddress}
                          percentage={split.percentage}
                          isOwner={split.isOwner}
                          onWalletChange={(wallet) => handleWalletChange(split.id, wallet)}
                          onPercentageChange={(percentage) => handlePercentageChange(split.id, percentage)}
                          onRemove={split.isOwner ? undefined : () => handleRemoveCollaborator(split.id)}
                        />
                      ))}
                    </div>

                    {/* Add collaborator button /}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddCollaborator}
                      className="w-full"
                      disabled={splits.find((s) => s.isOwner)?.percentage! < 10}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Collaborator
                    </Button>
                  </div>

                  {/* Visualizer /}
                  <div className="pt-4 border-t border-border">
                    <SplitVisualizer splits={splits} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer /}
            <div className="p-6 border-t border-border flex gap-3">
              {step === 2 && (
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}

              {step === 1 ? (
                <Button
                  variant="accent"
                  onClick={() => setStep(2)}
                  disabled={!isStep1Valid}
                  className="flex-1"
                >
                  Configure Splits
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  variant="hero"
                  onClick={handleSubmit}
                  disabled={!isStep2Valid}
                  className="flex-1"
                >
                  <Rocket className="w-4 h-4 mr-2" />
                  {editProduct ? 'Update Stream' : 'Deploy Programmable Stream'}
                </Button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddProductModal;
*/
}
