from ..imports import APIRouter, HTTPException, Session, Depends, Security, SQLAlchemyError, status
from .. import models
from ..dependencies import get_db, get_current_user
#from ..config import FRONTEND_BASE_URL

router = APIRouter(prefix="/api", tags=["Merchant"])

@router.get("/dashboard")
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
        ).order_by(models.Transactions.created_at.desc()).all()

        total_earnings = sum(sale.amount for sale in my_sales)
        total_sales_count = len(my_sales)

        sales_history = []
        for sale in my_sales:
            sales_history.append({
                "tx_hash": sale.tx_hash,
                "item_sold": sale.product.product_name,
                "earned": sale.amount,
                "date": sale.created_at.strftime("%Y-%m-%d")
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
                "wallet": current_user.wallet_address,
                "slug": current_user.unique_slug,
                "store_link": f"http://127.0.0.1:8000/store/{current_user.unique_slug}"
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


@router.delete("/delete-account")
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