from ..imports import APIRouter, HTTPException, Session, Depends, status, IntegrityError, timedelta, Security
from .. import models, schemas
from ..dependencies import get_db, pwd_cxt, create_access_token, generate_unique_slug, get_current_user
from ..config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix="/api", tags=["Merchant - Account"])

@router.post("/setup", response_model=schemas.UserResponse)
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
        unique_slug=generate_unique_slug(db)
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


@router.post('/login')
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


@router.get("/profile", response_model=schemas.Profile)
def profile(
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user),
):
    profile = db.query(models.User).filter(
        models.User.id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(status_code=404, detail="User not found")

    return profile


@router.put("/profile", response_model=schemas.Profile)
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
        models.User.id != current_user.id
    ).first()
    
    if existing_user:
        raise HTTPException(status_code=400, detail="Username is already taken")

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


@router.post("/profile/password")
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