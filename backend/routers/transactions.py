from ..imports import APIRouter, Session, Depends, Security, joinedload, HTTPException
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
        .filter(
            models.Products.merchant_id == current_user.id,
            models.Transactions.status == "paid"  # <--- UPDATE 1: Only show successful sales
        )
        .order_by(models.Transactions.created_at.desc()) # <--- UPDATE 2: Newest first
        .all()
    )

    return [
        schemas.TransactionOut(
            id=tx.id,
            tx_hash=tx.tx_hash,
            amount=tx.amount,
            bought_at=tx.created_at,
            product_name=tx.product.product_name,
            status=tx.status
        )
        for tx in transactions
    ]


# --- SCHEMA FOR THE UI ---

@router.get("/payouts", response_model=list[schemas.PayoutOut])
def get_payouts(
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user),
):
    # Query your PendingPayout table (Assuming you are populating this when a sale happens!)
    # We join Transactions -> Product to get the names/dates
    payouts = (
        db.query(models.PendingPayout)
        .join(models.Transactions, models.PendingPayout.transaction_source_id == models.Transactions.id)
        .join(models.Products, models.Transactions.product_id == models.Products.id)
        .filter(models.PendingPayout.merchant_id == current_user.id)
        .order_by(models.Transactions.created_at.desc())
        .all()
    )

    results = []
    for p in payouts:
        # Format a nice relative time or date string
        time_str = p.transaction_source.created_at.strftime("%Y-%m-%d %H:%M")
        
        # Determine "To" name (Owner or Collab)
        recipient_label = f"Collaborator {p.recipient_wallet[:4]}"
        if p.recipient_wallet.lower() == current_user.wallet_address.lower():
            recipient_label = "YOU (Owner)"

        results.append({
            "id": str(p.id),
            "to": recipient_label,
            "wallet": p.recipient_wallet,
            "amount": p.amount,
            "product": p.transaction_source.product.product_name,
            "time": time_str,
            "status": "SETTLED" if p.status == "paid" else "PENDING" # UI expects SETTLED/PENDING
        })

    return results

# --- ENDPOINT TO MARK AS PAID (Used by SettlementLog) ---

@router.post("/mark-paid")
def mark_payout_paid(
    req: schemas.MarkPaidRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Security(get_current_user)
):
    # Find the payout record
    payout = db.query(models.PendingPayout).filter(
        models.PendingPayout.id == int(req.tx_hash),
        models.PendingPayout.merchant_id == current_user.id
    ).first()

    if not payout:
        raise HTTPException(status_code=404, detail="Payout record not found")

    payout.status = "paid"
    # You could store req.confirmation_hash in a new column if you wanted
    
    db.commit()
    return {"status": "success"}