from .imports import FastAPI, CORSMiddleware, os, StaticFiles, FileResponse, OAuth2PasswordBearer, load_dotenv, HTTPBearer, JSONResponse, Request
from . import models
from .routers import auth, store, transactions, products, merchant
from .database import engine
from .config import build_frontend, DIST_DIR

build_frontend()
models.Base.metadata.create_all(bind=engine)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
load_dotenv()

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

# Include routers
app.include_router(auth.router)
app.include_router(merchant.router)
app.include_router(products.router)
app.include_router(store.router)
app.include_router(transactions.router)


@app.exception_handler(404)
async def custom_404_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={
            "status": "error",
            "code": 404,
            "message": "Endpoint not found",
            "detail": f"The path '{request.url.path}' does not exist on this server.",
            "suggestion": "Check your URL spelling or request method (GET vs POST)."
        }
    )


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

