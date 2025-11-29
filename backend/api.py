from .imports import FastAPI, CORSMiddleware, os, StaticFiles, HTTPException, FileResponse
from .database import engine, SessionLocal
from .config import build_frontend, DIST_DIR, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES


app = FastAPI(
    title="Notes API",
    description="API for user authentication and notes management",
    version="1.0.0"
)

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


@app.get('/')
def home():
    return "Hii"


@app.get('/home')
def home():
    return "Home"
# ------------------------------
# Static Files & React Routing
# ------------------------------
assets_path = os.path.join(DIST_DIR, "assets")

if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")
else:
    print(f"⚠️  WARNING: Assets directory not found at {assets_path}. Skipping mount.")

# 2. Favicon handler
@app.get("/favicon.ico", include_in_schema=False)
async def favicon():
    file_path = os.path.join(DIST_DIR, "favicon.ico")
    if os.path.exists(file_path):
        return FileResponse(file_path)
    raise HTTPException(status_code=404, detail="Favicon not found")

# 3. Catch-all for React (SPA)
# This MUST be the very last route in your file
@app.get("/{full_path:path}", include_in_schema=False)
async def serve_react(full_path: str):
    index_path = os.path.join(DIST_DIR, "index.html")
    
    if os.path.exists(index_path):
        return FileResponse(index_path)
        
    return {
        "error": "Frontend build not found.",
        "detail": f"Looked in: {DIST_DIR}",
        "solution": "Ensure build.sh ran successfully on Render."
    }