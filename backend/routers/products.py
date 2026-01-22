from ..imports import APIRouter, HTTPException, Session, Depends, Security, SQLAlchemyError, status
from .. import models, schemas
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/api", tags=["Merchant - Products"])

@router.get("/products", tags=["Merchant - Products"], response_model=list[schemas.ProductResponse])
def get_products(
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user),
):
    # 1. Fetch products as usual
    products = db.query(models.Products).filter(
        models.Products.merchant_id == current_user.id
    ).all()

    if not products:
        return []

    # 2. Manually construct the response to inject 'is_owner'
    results = []
    
    # Be careful with the attribute name on your User model. 
    # It is likely 'wallet_address' (snake_case) or 'walletAddress' (camelCase).
    # Check your models.py. I am assuming 'wallet_address' here.
    owner_wallet = current_user.wallet_address 

    for product in products:
        # Create a dictionary for the product
        product_data = {
            "id": product.id,
            "product_name": product.product_name,
            "price": product.price,
            "merchant_id": product.merchant_id,
            "splits": [] 
        }

        # Process splits to determine ownership
        for split in product.splits:
            # logic: If the split wallet matches the current user's wallet, they are the owner
            is_owner = (split.wallet_address.lower() == owner_wallet.lower())

            split_data = {
                "id": split.id,
                "wallet_address": split.wallet_address,
                "percentage": split.percentage,
                "is_owner": is_owner # <--- Injecting the logic here
            }
            product_data["splits"].append(split_data)

        results.append(product_data)

    return results


@router.post("/add-product", tags=["Merchant - Products"], response_model=schemas.ProductResponse)
def add_product(
    request: schemas.AddProduct,
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user)
):
    if not request.product_name or not request.price:
        raise HTTPException(status_code=400, detail="All fields are required.")
    
    current_total = sum(split.percentage for split in request.splits)
    if current_total != 100:
        raise HTTPException(status_code=400, detail=f"Total split percentage must equal 100 (got {current_total})")
    
    try:
        # 1. Create Product
        new_product = models.Products(
            product_name=request.product_name,
            price=request.price,
            merchant_id=current_user.id
        )
        db.add(new_product)
        db.flush() # Get ID

        # 2. Add Splits
        for split in request.splits:
            db.add(models.ProductSplits(
                wallet_address=split.wallet_address,
                percentage=split.percentage,
                product_id=new_product.id
            ))

        db.commit()
        db.refresh(new_product)

        # 3. MANUAL RESPONSE CONSTRUCTION (Fixes the ValidationError)
        # We assume the owner is the current user
        owner_wallet = current_user.wallet_address.lower()
        
        splits_response = []
        for split in new_product.splits:
            splits_response.append({
                "id": split.id,
                "wallet_address": split.wallet_address,
                "percentage": split.percentage,
                # Dynamic calculation:
                "is_owner": split.wallet_address.lower() == owner_wallet
            })

        return {
            "id": new_product.id,
            "product_name": new_product.product_name,
            "price": new_product.price,
            "merchant_id": new_product.merchant_id,
            "splits": splits_response
        }

    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise HTTPException(500, "Failed to create product")


@router.put("/update-product/{product_id}", tags=["Merchant - Products"], response_model=schemas.ProductResponse)
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

    # 2. Validate Total
    current_total = sum(split.percentage for split in request.splits)
    if current_total != 100:
        raise HTTPException(status_code=400, detail=f"Total split percentage must equal 100 (got {current_total})")

    # 3. Update Basic Fields
    product.product_name = request.product_name
    product.price = request.price

    # 4. Handle Splits Logic
    existing_splits = db.query(models.ProductSplits).filter(
        models.ProductSplits.product_id == product.id
    ).all()
    
    # Map for easy lookup
    existing_map = {split.wallet_address: split for split in existing_splits}
    incoming_wallets = [s.wallet_address for s in request.splits]

    # Delete removed splits
    for split in existing_splits:
        if split.wallet_address not in incoming_wallets:
            db.delete(split)

    # Update or Create splits
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
        
        # 5. MANUAL RESPONSE CONSTRUCTION (Fixes the ValidationError)
        owner_wallet = current_user.wallet_address.lower()
        
        splits_response = []
        for split in product.splits:
            splits_response.append({
                "id": split.id,
                "wallet_address": split.wallet_address,
                "percentage": split.percentage,
                # Dynamic calculation:
                "is_owner": split.wallet_address.lower() == owner_wallet
            })

        return {
            "id": product.id,
            "product_name": product.product_name,
            "price": product.price,
            "merchant_id": product.merchant_id,
            "splits": splits_response
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    

@router.delete("/delete-product/{product_id}", tags=["Merchant - Products"])
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

