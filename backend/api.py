from .imports import FastAPI, CORSMiddleware, os, StaticFiles, HTTPException, FileResponse, datetime, timedelta, jwt, Session, Depends, status, IntegrityError, OAuth2PasswordBearer, HTTPBearer, CryptContext, Security, ExpiredSignatureError, JWTError, SQLAlchemyError, List
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
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=[ALGORITHM]) 
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
    username = request.username.lower()
    if db.query(models.User).filter(models.User.username == username).first():
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
        username=username,
        email=request.email,
        password=hashed_password,
        wallet_address=request.walletAddress,
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
        data={"sub": username}, expires_delta=access_token_expires
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "email": request.email,
        "username": username,
        "wallet_address": request.walletAddress,
    }


@app.post('/api/login', tags=['User'])
def login(request: schemas.Login, db: Session = Depends(get_db)):
    username = request.username.lower()
    user = db.query(models.User).filter(models.User.username == username).first()

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

        inventory_list = []
        for p in my_products:
            product_splits = [
                {
                    "id": s.id,
                    "wallet_address": s.wallet_address,
                    "percentage": s.percentage,
                    "isOwner": s.wallet_address == current_user.wallet_address
                } 
                for s in p.splits
            ]

            inventory_list.append({
                "id": p.id,
                "name": p.product_name,
                "price": p.price,
                "splits": product_splits
            })

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
    

@app.get("/api/products", tags=["Product"], response_model=list[schemas.ProductResponse])
def get_products(
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user),
):
    # Fetch products owned by merchant
    products = db.query(models.Products).filter(
        models.Products.merchant_id == current_user.id
    ).all()

    if not products:
        return []

    return products


@app.post("/api/add-product", tags=["Product"], response_model=schemas.ProductResponse)
def add_product(request: schemas.AddProduct,
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user)):
    
    if not request.product_name or not request.price:
        raise HTTPException(status_code=400, detail="All fields are required.")
    
    # Validation logic
    current_total = sum(split.percentage for split in request.splits)
    if current_total != 100:
        raise HTTPException(status_code=400, detail=f"Total split percentage must equal 100 (got {current_total})")
    
    try:
        new_product = models.Products(
            product_name=request.product_name,
            price=request.price,
            merchant_id=current_user.id
        )
        db.add(new_product)
        db.flush() # Flush to get new_product.id

        for split in request.splits:
            db.add(models.ProductSplits(
                wallet_address=split.wallet_address,
                percentage=split.percentage,
                product_id=new_product.id
            ))

        db.commit()
        db.refresh(new_product)
        return new_product

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise HTTPException(500, "Failed to create product")


@app.put("/api/update-product/{product_id}", tags=["Product"], response_model=schemas.ProductResponse)
def update_product(
    product_id: int,
    request: schemas.AddProduct,
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user)
):
    # 1. Fetch Product
    product = db.query(models.Products).filter(
        models.Products.id == product_id,
        models.Products.merchant_id == current_user.id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.product_name = request.product_name
    product.price = request.price

    
    existing_splits = db.query(models.ProductSplits).filter(
        models.ProductSplits.product_id == product.id
    ).all()
    
    existing_map = {split.wallet_address: split for split in existing_splits}
    
    incoming_wallets = [s.wallet_address for s in request.splits]

    for split in existing_splits:
        if split.wallet_address not in incoming_wallets:
            db.delete(split)

    for split_data in request.splits:
        if split_data.wallet_address in existing_map:
            existing_record = existing_map[split_data.wallet_address]
            existing_record.percentage = split_data.percentage
        else:
            new_split = models.ProductSplits(
                wallet_address=split_data.wallet_address,
                percentage=split_data.percentage,
                product_id=product.id
            )
            db.add(new_split)

    try:
        db.commit()
        db.refresh(product)
        return product
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/delete-product/{product_id}", tags=["Product"])
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user)
):
    product = db.query(models.Products).filter(
        models.Products.id == product_id,
        models.Products.merchant_id == current_user.id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    try:
        db.delete(product)
        db.commit()
        return {"detail": "Product deleted successfully"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete product"
        ) from e


@app.get("/api/profile", tags=["User"], response_model=schemas.Profile)
def profile(db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user),
    ):
    
    profile = db.query(models.User).filter(
        models.User.id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="User not found")

    return profile


@app.put("/api/profile", response_model=schemas.Profile, tags=["User"])
def update_profile(
    request: schemas.Profile,
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user)
):
    profile = db.query(models.User).filter(
        models.User.id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    existing_user = db.query(models.User).filter(
    models.User.username == request.username.lower(),
    models.User.id != current_user.id).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username is already taken"
        )

    profile.username = request.username.lower()
    profile.email = request.email
    profile.wallet_address = request.wallet_address
    
    try:
        db.commit()
        db.refresh(profile)
        return profile
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/profile/password", tags=["User"])
def change_password(
    data: schemas.UpdatePassword,
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user),
):
    user = db.query(models.User).filter(models.User.id == current_user.id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if not pwd_cxt.verify(data.old_password, user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password cannot be updated",
        )

    user.password = pwd_cxt.hash(data.new_password)
    db.commit()
    db.refresh(user)

    return {"message": "Password updated successfully"}



@app.delete("/api/delete-account", tags=["User"])
def delete_account(
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user)
):
    profile = db.query(models.User).filter(
        models.User.id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="Account not found")

    try:
        db.delete(profile)
        db.commit()
        return {"detail": "Account deleted successfully"}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        ) from e


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

