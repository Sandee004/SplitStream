export interface Transaction {
  id: string;
  to: string;
  wallet: string;
  amount: number;
  product: string;
  time: string;
  status: "SETTLED" | "PENDING" | "FAILED";
}

export interface Collaborator {
  id: string;
  name: string;
  wallet: string;
  total: number;
  share: number;
}
