# 💸 SplitStream

**Automated Revenue Sharing & Payment Protocol**

SplitStream is a decentralized payment infrastructure that allows merchants to automatically split revenue with collaborators, suppliers, and team members in real-time. Built for the modern creator economy, it eliminates the need for manual reconciliation and trust-based accounting.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

---

## 📖 Table of Contents
- [Problem Statement](#-problem-statement)
- [Solution](#-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)


---

## 🛑 Problem Statement

In collaborative projects (e.g., a developer and a designer selling a digital product), revenue sharing is painful:
1.  **Trust Gap:** Collaborators have to trust the merchant to report sales accurately.
2.  **Manual Labor:** The merchant must manually calculate percentages and send individual transfers at the end of the month.
3.  **Delayed Payouts:** Collaborators often wait weeks to get their share of a sale that happened today.

## 💡 Solution

**SplitStream** acts as a programmable payment layer. When a customer buys a product:
1.  The payment is verified on-chain.
2.  The protocol looks up the "Split Rules" for that specific product (e.g., 70% to Owner, 30% to Designer).
3.  Funds are allocated immediately and transparently leaving the merchant with the task of only a button push to authorize the split

---

## ✨ Key Features

* **Dynamic Split Rules:** Create products and assign unlimited wallet addresses as beneficiaries with specific percentage shares.
* **Brutalist Storefront:** A unique, high-conversion public storefront for merchants to sell digital assets.
* **Crypto-Native Settlements:** Built for the **MNEE** token ecosystem on Ethereum Mainnet.
* **Transparent Ledger:** An immutable "Settlement Log" that tracks every split, status (Pending/Settled), and blockchain transaction hash.
* **Frontend Filtering:** Smart logic that distinguishes between the Merchant (Owner) and Collaborators without complex database flags.
* **Wagmi & Web3 Integration:** Seamless wallet connection for both merchants (to settle) and customers (to buy).

---

## 🛠 Tech Stack

### **Frontend (The Interface)**
* **Framework:** React (Vite) + TypeScript
* **Styling:** Tailwind CSS (Custom "Emerald/Lime" Brutalist Theme)
* **Animation:** Framer Motion
* **Web3:** Wagmi v2, Viem, TanStack Query
* **Icons:** Lucide React

### **Backend (The Logic)**
* **Framework:** FastAPI (Python)
* **Database:** SQLAlchemy (ORM)
* **Validation:** Pydantic
* **Security:** JWT Authentication




Built with 💚 by Sandee
