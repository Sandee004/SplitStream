from ..imports import APIRouter, HTTPException, Session, Depends, os, Web3, load_dotenv
from .. import models, schemas
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/api", tags=["Client"])
load_dotenv()

RPC_URL = os.getenv("RPC_URL")
if not RPC_URL:
    print("RPC is invalid")

MNEE_TOKEN_ADDRESS = os.getenv("MNEE_TOKEN_ADDRESS")
if not MNEE_TOKEN_ADDRESS:
    print("MNEE Token not gotten")


CHAIN_ID = os.getenv("CHAIN_ID")
if not CHAIN_ID:
    print("Chain ID hasn't been gotten")


w3 = Web3(Web3.HTTPProvider(RPC_URL))
MNEE_TOKEN = Web3.to_checksum_address(MNEE_TOKEN_ADDRESS)
CHAIN_ID = int(CHAIN_ID)

ERC20_ABI = [
    {
        "constant": False,
        "inputs": [
            {"name": "_to", "type": "address"},
            {"name": "_value", "type": "uint256"},
        ],
        "name": "transfer",
        "outputs": [{"name": "", "type": "bool"}],
        "type": "function",
    }
]


@router.get("/store/{unique_slug}")
def get_store_products(
    unique_slug: str,
    db: Session = Depends(get_db),
):
    merchant = (
        db.query(models.User)
        .filter(models.User.unique_slug == unique_slug)
        .first()
    )

    if not merchant:
        raise HTTPException(status_code=404, detail="Store not found")

    return merchant.products


@router.post("/make-purchase")
def make_purchase(
    request: schemas.PurchaseRequest,
    db: Session = Depends(get_db),
):
    merchant = db.query(models.User).filter(
        models.User.unique_slug == request.slug
    ).first()

    if not merchant:
        raise HTTPException(404, "Merchant not found")

    product = db.query(models.Products).filter(
        models.Products.id == request.product_id
    ).first()

    if not product:
        raise HTTPException(404, "Product not found")

    total_amount = product.price * request.quantity

    transaction = models.Transactions(
        merchant_id=merchant.id,
        product_id=product.id,
        quantity=request.quantity,
        amount=total_amount,
        status="pending",
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    return {
        "transaction_id": transaction.id,
        "amount": float(total_amount),
        "merchant_wallet": merchant.wallet_address,
        "token_address": MNEE_TOKEN,
        "chain_id": CHAIN_ID,
    }


@router.post("/confirm-payment")
def confirm_payment(
    request: schemas.ConfirmPaymentRequest,
    db: Session = Depends(get_db),
):
    transaction = db.query(models.Transactions).filter(
        models.Transactions.id == request.transaction_id,
        models.Transactions.status == "pending",
    ).first()

    if not transaction:
        raise HTTPException(404, "Purchase not found or already processed")

    tx_hash = request.tx_hash

    try:
        tx = w3.eth.get_transaction(tx_hash)
        receipt = w3.eth.get_transaction_receipt(tx_hash)
    except Exception:
        raise HTTPException(400, "Invalid transaction hash")

    if tx["to"] is None or tx["to"].lower() != MNEE_TOKEN.lower():
        raise HTTPException(400, "Transaction is not MNEE token transfer")

    contract = w3.eth.contract(address=MNEE_TOKEN, abi=ERC20_ABI)

    try:
        func, params = contract.decode_function_input(tx["input"])
    except Exception:
        raise HTTPException(400, "Failed to decode ERC20 transaction")

    if func.fn_name != "transfer":
        raise HTTPException(400, "Not a transfer() call")

    to_address = params["_to"]
    merchant = db.query(models.User).get(transaction.merchant_id)
    
    if to_address.lower() != merchant.wallet_address.lower():
        raise HTTPException(400, "Wrong recipient")

    on_chain_value = params["_value"]
    
    expected_amount_wei = w3.to_wei(str(transaction.amount), "ether")

    if on_chain_value != expected_amount_wei:
        raise HTTPException(
            400, 
            f"Wrong amount. Expected {expected_amount_wei}, got {on_chain_value}"
        )

    product = db.query(models.Products).get(transaction.product_id)
    
    for split in product.splits:
        if split.wallet_address.lower() == merchant.wallet_address.lower():
            continue

        partner_share = transaction.amount * (split.percentage / 100)

        payout = models.PendingPayout(
            merchant_id=merchant.id,
            recipient_wallet=split.wallet_address,
            amount=partner_share,
            status="unpaid",
            transaction_source_id=transaction.id
        )
        db.add(payout)

    transaction.status = "paid"
    transaction.tx_hash = tx_hash
    db.commit()

    return {"status": "paid"}



@router.get("/api/payouts")
def get_payouts(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    payouts = db.query(models.PendingPayout).filter(
        models.PendingPayout.merchant_id == current_user.id,
        models.PendingPayout.status == "unpaid"
    ).all()
    
    result = []
    for p in payouts:
        result.append({
            "id": p.id,
            "recipient_wallet": p.recipient_wallet,
            "amount": p.amount,
            "status": p.status,
        })
    return result

# 2. MARK AS PAID


@router.post("/api/payouts/{payout_id}/mark-paid")
def mark_payout_paid(
    payout_id: int, 
    request: schemas.MarkPaidRequest,
    db: Session = Depends(get_db), 
    current_user = Depends(get_current_user)
):
    payout = db.query(models.PendingPayout).filter(
        models.PendingPayout.id == payout_id,
        models.PendingPayout.merchant_id == current_user.id
    ).first()
    
    if not payout:
        raise HTTPException(404, "Payout not found")
        
    payout.status = "paid"
    db.commit()
    return {"status": "success"}