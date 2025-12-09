from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    wallet_address = Column(String, nullable=False)

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

    id = Column(Integer, primary_key=True, index=True)
    tx_hash = Column(String, unique=True, nullable=False)
    amount = Column(Integer, nullable=False) # How much the merchant earned
    bought_at = Column(DateTime(timezone=True), server_default=func.now())

    product_id = Column(Integer, ForeignKey("products.id"))
    product = relationship("Products", back_populates="sales")