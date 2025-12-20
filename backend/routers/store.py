from ..imports import APIRouter, HTTPException, Session, Depends, os, Web3, load_dotenv
from .. import models, schemas
from ..dependencies import get_db, get_current_user

router = APIRouter(prefix="/api", tags=["Client"])

RPC_URL = os.getenv("RPC_URL")
if not RPC_URL:
    print("RPC is invalid")
print (RPC_URL)

MNEE_TOKEN_ADDRESS = os.getenv("MNEE_TOKEN_ADDRESS")
if not MNEE_TOKEN_ADDRESS:
    print("MNEE Token not gotten")
print(MNEE_TOKEN_ADDRESS)

CHAIN_ID = os.getenv("CHAIN_ID")
if not CHAIN_ID:
    print("Chain ID hasn't been gotten")
print(CHAIN_ID)

w3 = Web3(Web3.HTTPProvider(RPC_URL))
if not w3.is_connected():
    raise RuntimeError("Web3 provider not connected")

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
load_dotenv()

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
    user=Depends(get_current_user),
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
    value = params["_value"]

    merchant = db.query(models.User).get(transaction.merchant_id)
    expected_amount = transaction.amount
    #expected_amount = int(w3.to_wei(transaction.amount, "ether"))

    if to_address.lower() != merchant.wallet_address.lower():
        raise HTTPException(400, "Wrong recipient")

    if value != expected_amount:
        raise HTTPException(400, "Wrong token amount")

    if receipt["status"] != 1:
        raise HTTPException(400, "Transaction failed on-chain")

    transaction.status = "paid"
    transaction.tx_hash = tx_hash
    db.commit()

    return {"status": "paid"}