from .imports import FastAPI, CORSMiddleware, os, StaticFiles, HTTPException, FileResponse, datetime, timedelta, jwt, Session, Depends, status, IntegrityError, OAuth2PasswordBearer, HTTPBearer, CryptContext
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
        password=hashed_password
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
        "username": request.username
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

