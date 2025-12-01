from .imports import FastAPI, CORSMiddleware, os, StaticFiles, HTTPException, FileResponse, datetime, timedelta, jwt, Session, Depends, status, IntegrityError, OAuth2PasswordBearer, HTTPBearer, CryptContext, ExpiredSignatureError, JWTError
from . import models, schemas
from .database import engine, SessionLocal
from .config import build_frontend, DIST_DIR, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES

build_frontend()
models.Base.metadata.create_all(bind=engine)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

app = FastAPI(
    title="SplitStream API",
    description="API for a wallet software",
    version="1.0.0"
)

oauth2_scheme = HTTPBearer()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Generate a JWT token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # 1. Decode the token
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        
        # 2. Extract the USERNAME (sub), not the email
        username: str = payload.get("sub")
        
        if username is None:
            raise credentials_exception
            
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError:
        raise credentials_exception

    # 3. Query the database using the USERNAME field
    user = db.query(models.User).filter(models.User.username == username).first()
    
    if user is None:
        raise credentials_exception

    return user

pwd_cxt = CryptContext(schemes=['bcrypt'], deprecated="auto")


@app.post("/api/setup", tags=["User"], response_model=schemas.UserResponse)
def setup(request: schemas.User, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.username == request.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    if db.query(models.User).filter(models.User.email == request.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    hashed_password = pwd_cxt.hash(request.password)
    new_user = models.User(
        username=request.username,
        email=request.email,
        password=hashed_password,
        wallet_address=request.wallet_address,
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create account due to database error"
        )

    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": request.username}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "email": request.email,
        "username": request.username,
        "wallet_address": request.wallet_address,
    }

@app.post('/api/login', tags=['User'])
def login(request: schemas.Login, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == request.username).first()

    invalid_credentials = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not user or not pwd_cxt.verify(request.password, user.password):
        raise invalid_credentials

    # Create JWT access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )

    dashboard_data = {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {"username": user.username, "wallet_address": user.wallet_address},
    }

    return dashboard_data


@app.get("/api/dashboard", tags=["Merchant"])
def dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    try:
        my_products = db.query(models.Products).filter(
            models.Products.merchant_id == current_user.id
        ).all()

        product_ids = [p.id for p in my_products]

        my_sales = db.query(models.Transactions).filter(
            models.Transactions.product_id.in_(product_ids)
        ).order_by(models.Transactions.bought_at.desc()).all()

        total_earnings = sum(sale.amount for sale in my_sales)
        total_sales_count = len(my_sales)

        sales_history = []
        for sale in my_sales:
            sales_history.append({
                "tx_hash": sale.tx_hash,
                "item_sold": sale.product.product_name,
                "earned": sale.amount,
                "date": sale.bought_at.strftime("%Y-%m-%d")
            })

        inventory_list = [
            {"id": p.id, "name": p.product_name, "price": p.price} 
            for p in my_products
        ]

        return {
            "merchant_profile": {
                "username": current_user.username,
                "wallet": current_user.wallet_address
            },
            "stats": {
                "total_revenue": total_earnings,
                "items_sold": total_sales_count
            },
            "inventory": inventory_list,
            "recent_sales": sales_history
        }

    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail="Dashboard error")
    

# ------------------------------
# Static Files & React Routing
# ------------------------------
# Safety check: Ensure the folder exists before mounting, or Uvicorn crashes.
assets_path = os.path.join(DIST_DIR, "assets")
if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
else:
    print(f"⚠️ Warning: Assets folder not found at {assets_path}. Frontend might look broken.")

@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    file_path = os.path.join(DIST_DIR, "favicon.ico")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    return {"error": "Favicon not found"}

@app.get("/{full_path:path}", include_in_schema=False)
async def serve_react(full_path: str):
    index_path = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "error": "Frontend build not found.", 
        "detail": "Please check console logs to see if 'npm run build' failed."
    }

