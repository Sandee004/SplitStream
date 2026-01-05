from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func, Numeric, Float
from sqlalchemy.orm import relationship
from .imports import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    wallet_address = Column(String, nullable=False)
    unique_slug = Column(String, unique=True, nullable=False)

    products = relationship("Products", back_populates="merchant")

class Products(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String, nullable=False)
    price = Column(Integer, nullable=False)
    merchant_id = Column(Integer, ForeignKey("users.id"))
    merchant = relationship("User", back_populates="products")
    
    splits = relationship("ProductSplits", back_populates="product", cascade="all, delete-orphan")
    #splits = relationship("ProductSplits", back_populates="product", cascade="all, delete")
    sales = relationship("Transactions", back_populates="product")

class ProductSplits(Base):
    __tablename__ = "product_splits"

    id = Column(Integer, primary_key=True, index=True)
    wallet_address = Column(String, nullable=False)
    percentage = Column(Integer, nullable=False)

    product_id = Column(Integer, ForeignKey("products.id"))
    product = relationship("Products", back_populates="splits")


class Transactions(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    merchant_id = Column(Integer, ForeignKey("users.id"))
    product_id = Column(Integer, ForeignKey("products.id"))

    quantity = Column(Integer, nullable=False)
    amount = Column(Numeric(18, 8), nullable=False)

    status = Column(String, default="pending")
    tx_hash = Column(String, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    product = relationship("Products", back_populates="sales")
    merchant = relationship("User")


class PendingPayout(Base):
    __tablename__ = "pending_payouts"
    id = Column(Integer, primary_key=True, index=True)
    merchant_id = Column(Integer, ForeignKey("users.id"))
    recipient_wallet = Column(String)
    amount = Column(Float)
    status = Column(String, default="pending") # pending, paid
    transaction_source_id = Column(Integer, ForeignKey("transactions.id"))
