from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class User(BaseModel):
    username: str
    email: str
    password: str
    walletAddress: str

class Login(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    access_token: str
    username: str
    email: str
    wallet_address: str

class SplitSchema(BaseModel):
    wallet_address: str
    percentage: int

class SplitResponse(SplitSchema):
    id: int
    wallet_address: str
    percentage: int
    
    class Config:
        from_attributes = True

class AddProduct(BaseModel):
    product_name: str
    price: float
    splits: list[SplitSchema]

class ProductResponse(BaseModel):
    id: int
    product_name: str
    price: float
    merchant_id: int
    splits: List[SplitResponse]

    class Config:
        from_attributes = True

class Profile(BaseModel):
    username: str
    email: str
    wallet_address: str

class UpdatePassword(BaseModel):
    old_password: str
    new_password: str

class TransactionOut(BaseModel):
    id: int
    tx_hash: str
    amount: int
    bought_at: datetime
    product_name: str

    class Config:
        from_attributes = True