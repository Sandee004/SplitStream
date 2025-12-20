from ..imports import APIRouter, Session, Depends, Security, joinedload
from .. import models, schemas
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/api", tags=["Merchant"])

@router.get("/transactions", response_model=list[schemas.TransactionOut])
def get_transaction_history(
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user),
):
    transactions = (
        db.query(models.Transactions)
        .join(models.Products)
        .options(joinedload(models.Transactions.product))
        .filter(models.Products.merchant_id == current_user.id)
        .all()
    )

    return [
        schemas.TransactionOut(
            id=tx.id,
            tx_hash=tx.tx_hash,
            amount=tx.amount,
            bought_at=tx.bought_at,
            product_name=tx.product.product_name,
        )
        for tx in transactions
    ]