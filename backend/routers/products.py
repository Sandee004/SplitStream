from ..imports import APIRouter, HTTPException, Session, Depends, Security, SQLAlchemyError, status
from .. import models, schemas
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/api", tags=["Merchant - Products"])


@router.get("/api/products", tags=["Merchant - Products"], response_model=list[schemas.ProductResponse])
def get_products(
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user),
):
    products = db.query(models.Products).filter(
        models.Products.merchant_id == current_user.id
    ).all()

    if not products:
        return []

    return products


@router.post("/api/add-product", tags=["Merchant - Products"], response_model=schemas.ProductResponse)
def add_product(request: schemas.AddProduct,
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user)):
    
    if not request.product_name or not request.price:
        raise HTTPException(status_code=400, detail="All fields are required.")
    
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


@router.put("/api/update-product/{product_id}", tags=["Merchant - Products"], response_model=schemas.ProductResponse)
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


@router.delete("/api/delete-product/{product_id}", tags=["Merchant - Products"])
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

