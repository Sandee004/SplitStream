# seed.py
from .imports import uuid, random, Session, CryptContext, secrets, string
from . import models

pwd_cxt = CryptContext(schemes=['bcrypt'], deprecated="auto")

def generate_unique_slug(db: Session, length: int = 8) -> str:
    alphabet = string.ascii_lowercase + string.digits
    while True:
        slug = ''.join(secrets.choice(alphabet) for _ in range(length))
        exists = db.query(models.User).filter(models.User.unique_slug == slug).first()
        if not exists:
            return slug

def seed_demo_user(db: Session):
    if db.query(models.User).filter(models.User.username == "example").first():
        print("Merchant 'example' already exists. Skipping.")
        return

    # 1. Create Merchant
    merchant = models.User(
        username="example",
        email="example@gmail.com",
        password=pwd_cxt.hash("1234"),
        wallet_address="0xB9e367CB4938DC830108aCd66642f2F76fba1393",
        unique_slug="steezed"
    )
    db.add(merchant)
    db.commit()
    db.refresh(merchant)

    # 2. Create Products
    my_inventory = [
        models.Products(product_name="Premium T-Shirt", price=50, merchant_id=merchant.id),
        models.Products(product_name="Digital Art Pack", price=120, merchant_id=merchant.id),
        models.Products(product_name="Consultation Call", price=300, merchant_id=merchant.id),
    ]
    db.add_all(my_inventory)
    db.commit()

    # 3. Create Splits
    for p in my_inventory: 
        db.refresh(p)
        if p.product_name == "Premium T-Shirt":
            # Split into 2 wallets (Merchant 70%, Partner 30%)
            db.add_all([
                models.ProductSplits(wallet_address=merchant.wallet_address, percentage=70, product_id=p.id),
                models.ProductSplits(wallet_address="0xPartnerWalletABC", percentage=30, product_id=p.id)
            ])
        elif p.product_name == "Digital Art Pack":
            # All to merchant
            db.add(models.ProductSplits(wallet_address=merchant.wallet_address, percentage=100, product_id=p.id))
        elif p.product_name == "Consultation Call":
            # Split 50/50
            db.add_all([
                models.ProductSplits(wallet_address=merchant.wallet_address, percentage=50, product_id=p.id),
                models.ProductSplits(wallet_address="0xCoHostWalletXYZ", percentage=50, product_id=p.id)
            ])

    db.commit()

    # 4. Create Transactions (Sales)
    sales_list = []
    payouts_list = [] # List to hold the pending debts

    for _ in range(10):
        sold_item = random.choice(my_inventory)
        qty = 1 
        
        # Create the paid transaction (Inflow)
        sale = models.Transactions(
            tx_hash="0x" + uuid.uuid4().hex,
            amount=sold_item.price * qty,
            product_id=sold_item.id,
            merchant_id=merchant.id,
            quantity=qty,
            status="paid"
        )
        sales_list.append(sale)
        
        # We need to add and flush here so 'sale.id' is generated for the payout foreign key
        db.add(sale)
        db.flush() 

        # --- GENERATE PENDING PAYOUTS FOR THIS SALE ---
        # Refresh item to access splits
        db.refresh(sold_item) 
        
        for split in sold_item.splits:
            # We don't owe money to ourselves
            if split.wallet_address.lower() == merchant.wallet_address.lower():
                continue

            # Calculate Partner's Share
            owed_amount = sale.amount * (split.percentage / 100)

            # Create Pending Payout Record
            payout = models.PendingPayout(
                merchant_id=merchant.id,
                recipient_wallet=split.wallet_address,
                amount=owed_amount,
                status="unpaid", # This makes it show up in the Payouts tab
                transaction_source_id=sale.id
            )
            payouts_list.append(payout)

    # Bulk add payouts
    db.add_all(payouts_list)
    db.commit()
    
    print(f"Seeded Merchant '{merchant.username}'")
    print(f"-> {len(my_inventory)} Products")
    print(f"-> {len(sales_list)} Sales")
    print(f"-> {len(payouts_list)} Pending Payouts created")

from .database import SessionLocal

if __name__ == "__main__":
    print("Seeding data...")
    db = SessionLocal()
    try:
        seed_demo_user(db)
    finally:
        db.close()