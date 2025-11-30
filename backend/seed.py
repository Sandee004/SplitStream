#seed.py
from .imports import uuid, random, Session, CryptContext
from . import models

pwd_cxt = CryptContext(schemes=['bcrypt'], deprecated="auto")

def seed_demo_user(db: Session):
    # 1. Create Products First
    # Check if products exist, if not, create them
    if not db.query(models.Products).first():
        demo_products = [
            models.Products(product_name="T-shirt", price=10),
            models.Products(product_name="Nike sneakers", price=12),
            models.Products(product_name="Devfest cap", price=5),
            models.Products(product_name="Mercedes", price=500),
            models.Products(product_name="Gas", price=50),
        ]
        db.add_all(demo_products)
        db.commit()
        print("Products seeded.")

    if db.query(models.User).filter(models.User.username == "Example").first():
        print("User 'Example' already exists. Skipping.")
        return

    hashed_password = pwd_cxt.hash("1234")
    fake_wallet = "0x" + uuid.uuid4().hex 
    new_user = models.User(
        username="Example",
        email="example@gmail.com",
        password=hashed_password,
        wallet_address=fake_wallet
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    all_products = db.query(models.Products).all()
    
    tx_list = []
    for _ in range(5):
        selected_product = random.choice(all_products)

        tx = models.Transactions(
            tx_hash="0x" + uuid.uuid4().hex,
            amount=selected_product.price,
            user_id=new_user.id,
            product_id=selected_product.id
        )
        tx_list.append(tx)

    db.add_all(tx_list)
    db.commit()
    print("Seeded User, Products, and Transactions.")


from .database import SessionLocal

if __name__ == "__main__":
    print("Seeding data...")
    db = SessionLocal()
    try:
        seed_demo_user(db)
    finally:
        db.close()