/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./dashboard-layout";
import HeroAction from "./hero-action";
import ActiveStreams from "./active-streams";
import TransactionTable from "./transaction-table";
import ProductModal from "./product-modal";

export type Product = {
  id: string;
  name: string;
  price: number;
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    try {
      console.log("shit");
    } catch {
      navigate("/setup");
    }
  }, [navigate]);

  const handleOpenModal = (product?: Product) => {
    setEditingProduct(product || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-[32px] w-[100%]">
        <HeroAction onAddNew={() => handleOpenModal()} />
        <ActiveStreams
          onEdit={handleOpenModal}
          products={[]}
          onDelete={(_id: string) => {}}
        />
        <TransactionTable transactions={[]} />
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={editingProduct}
      />
    </DashboardLayout>
  );
}
