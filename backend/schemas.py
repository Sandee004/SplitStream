from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class User(BaseModel):
    username: str
    email: str
    wallet_address: str

class Login(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    access_token: str
    username: str
    email: str
    wallet_address: str
