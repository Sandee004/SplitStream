# seed.py
from .imports import uuid, random, Session, CryptContext, secrets, string
from . import models
from datetime import datetime, timedelta

pwd_cxt = CryptContext(schemes=['bcrypt'], deprecated="auto")

def generate_unique_slug(db: Session, length: int = 8) -> str:
    alphabet = string.ascii_lowercase + string.digits
    while True:
        slug = ''.join(secrets.choice(alphabet) for _ in range(length))
        exists = db.query(models.User).filter(models.User.unique_slug == slug).first()
        if not exists:
            return slug

def seed_demo_user(db: Session):
    # Check if user exists to avoid duplicates
    if db.query(models.User).filter(models.User.username == "example").first():
        print("Merchant 'example' already exists. Skipping.")
        return

    print("🌱 Seeding Merchant...")

    # 1. Create Merchant
    merchant = models.User(
        username="example",
        email="example@gmail.com",
        password=pwd_cxt.hash("1234"),
        wallet_address="0xB9e367CB4938DC830108aCd66642f2F76fba1393", # Your Metamask wallet
        unique_slug="steezed"
    )
    db.add(merchant)
    db.commit()
    db.refresh(merchant)

    # 2. Create Products
    print("📦 Seeding Inventory...")
    p1 = models.Products(product_name="Premium T-Shirt", price=50, merchant_id=merchant.id)
    p2 = models.Products(product_name="Digital Art Pack", price=120, merchant_id=merchant.id)
    p3 = models.Products(product_name="Consultation Call", price=300, merchant_id=merchant.id)
    
    my_inventory = [p1, p2, p3]
    db.add_all(my_inventory)
    db.commit()

    # 3. Create Splits (Programmable Money Rules)
    print("🔀 Configuring Splits...")
    
    # Refresh to ensure IDs are generated
    for p in my_inventory:
        db.refresh(p)

    # Product 1: T-Shirt (70% You, 30% Supplier)
    db.add(models.ProductSplits(wallet_address=merchant.wallet_address, percentage=70, product_id=p1.id))
    db.add(models.ProductSplits(wallet_address="0x71C7656EC7ab88b098defB751B7401B5f6d8976F", percentage=30, product_id=p1.id))

    # Product 2: Art Pack (100% You)
    db.add(models.ProductSplits(wallet_address=merchant.wallet_address, percentage=100, product_id=p2.id))

    # Product 3: Consultation (50% You, 50% Partner)
    db.add(models.ProductSplits(wallet_address=merchant.wallet_address, percentage=50, product_id=p3.id))
    db.add(models.ProductSplits(wallet_address="0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7", percentage=50, product_id=p3.id))

    db.commit()

    # 4. Create Transactions & Payouts (The Settlement Log Data)
    print("💸 Simulating Sales & Pending Payouts...")
    
    sales_list = []
    payouts_list = []

    # Create 15 random sales
    for i in range(15):
        sold_item = random.choice(my_inventory)
        qty = 1 
        
        # Randomize time (Past 24 hours)
        fake_time = datetime.utcnow() - timedelta(hours=random.randint(1, 48), minutes=random.randint(1, 59))

        # Create the Sales Record (Inflow)
        sale = models.Transactions(
            tx_hash="0x" + uuid.uuid4().hex,
            amount=sold_item.price * qty,
            product_id=sold_item.id,
            merchant_id=merchant.id,
            quantity=qty,
            status="paid",
            created_at=fake_time
        )
        db.add(sale)
        db.flush() # Flush to get sale.id for the foreign key

        # --- GENERATE PAYOUTS (The Outflow) ---
        # We need to query splits manually to be safe since relationships might be lazy loaded
        splits = db.query(models.ProductSplits).filter(models.ProductSplits.product_id == sold_item.id).all()
        
        for split in splits:
            # Skip Owner (We don't create a 'Pending Payout' for ourselves)
            if split.wallet_address.lower() == merchant.wallet_address.lower():
                continue

            # Calculate Split Amount
            owed_amount = sale.amount * (split.percentage / 100)

            # Randomize Status (80% pending, 20% already settled for demo purposes)
            is_settled = random.choice([True, False, False, False]) 
            payout_status = "paid" if is_settled else "pending"

            # Create the Payout Record
            payout = models.PendingPayout(
                merchant_id=merchant.id,
                recipient_wallet=split.wallet_address,
                amount=owed_amount,
                status=payout_status, 
                transaction_source_id=sale.id
            )
            payouts_list.append(payout)

    db.add_all(payouts_list)
    db.commit()
    
    print("✅ Seed Complete!")
    print(f"   Merchant: {merchant.username}")
    print(f"   Products: {len(my_inventory)}")
    print(f"   Payouts: {len(payouts_list)} generated")

from .database import SessionLocal

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_demo_user(db)
    finally:
        db.close()