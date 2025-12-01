#seed.py
from .imports import uuid, random, Session, CryptContext
from . import models

pwd_cxt = CryptContext(schemes=['bcrypt'], deprecated="auto")

def seed_demo_user(db: Session):
    if db.query(models.User).filter(models.User.username == "Example").first():
        print("Merchant 'Example' already exists. Skipping.")
        return

    merchant = models.User(
        username="Example",
        email="example@gmail.com",
        password=pwd_cxt.hash("1234"),
        wallet_address="0xMerchantWallet123"
    )
    db.add(merchant)
    db.commit()
    db.refresh(merchant)

    my_inventory = [
        models.Products(product_name="Premium T-Shirt", price=50, merchant_id=merchant.id),
        models.Products(product_name="Digital Art Pack", price=120, merchant_id=merchant.id),
        models.Products(product_name="Consultation Call", price=300, merchant_id=merchant.id),
    ]
    db.add_all(my_inventory)
    db.commit()

    for p in my_inventory: db.refresh(p)

    sales_list = []
    for _ in range(10): # Simulate 10 sales
        sold_item = random.choice(my_inventory)
        
        sale = models.Transactions(
            tx_hash="0x" + uuid.uuid4().hex,
            amount=sold_item.price,
            product_id=sold_item.id
        )
        sales_list.append(sale)

    db.add_all(sales_list)
    db.commit()
    
    print(f"Seeded Merchant '{merchant.username}', {len(my_inventory)} Products, and {len(sales_list)} Sales.")

from .database import SessionLocal

if __name__ == "__main__":
    print("Seeding data...")
    db = SessionLocal()
    try:
        seed_demo_user(db)
    finally:
        db.close()