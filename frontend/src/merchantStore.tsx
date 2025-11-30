{
  /*import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Split {
  id: string;
  walletAddress: string;
  percentage: number;
  isOwner?: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  splits: Split[];
  createdAt: Date;
}

export interface Transaction {
  id: string;
  txHash: string;
  productName: string;
  amount: number;
  timestamp: Date;
}

interface MerchantState {
  alias: string;
  walletAddress: string;
  products: Product[];
  transactions: Transaction[];
  setMerchant: (alias: string, walletAddress: string) => void;
  addProduct: (product: Omit<Product, "id" | "createdAt">) => void;
  updateProduct: (
    id: string,
    product: Omit<Product, "id" | "createdAt">
  ) => void;
  deleteProduct: (id: string) => void;
}

// Generate placeholder transactions
const generateTransactions = (): Transaction[] => {
  const products = [
    "AI Art Pack",
    "Sound Bundle",
    "Code Templates",
    "Design Kit",
  ];
  return Array.from({ length: 8 }, (_, i) => ({
    id: `tx-${i}`,
    txHash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random()
      .toString(16)
      .slice(2, 6)}`,
    productName: products[Math.floor(Math.random() * products.length)],
    amount: Math.floor(Math.random() * 500) + 50,
    timestamp: new Date(Date.now() - Math.random() * 86400000 * 7),
  }));
};

export const useMerchantStore = create<MerchantState>()(
  persist(
    (set) => ({
      alias: "",
      walletAddress: "",
      products: [],
      transactions: generateTransactions(),
      setMerchant: (alias, walletAddress) => set({ alias, walletAddress }),
      addProduct: (product) =>
        set((state) => ({
          products: [
            ...state.products,
            {
              ...product,
              id: `product-${Date.now()}`,
              createdAt: new Date(),
            },
          ],
        })),
      updateProduct: (id, product) =>
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...product } : p
          ),
        })),
      deleteProduct: (id) =>
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        })),
    }),
    {
      name: "splitstream-merchant",
    }
  )
);
*/
}
