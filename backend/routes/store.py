"""
Store routes — /api/store/*
Products listing and (later) order management.
"""
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from database import get_db
from models import Product, Order, OrderItem, User
from schemas import (
    ProductResponse,
    ProductListResponse,
    OrderCreate,
    OrderResponse,
    CheckoutSessionCreate,
)
from routes.auth import get_current_user

import os
import stripe

stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "sk_test_1234567890abcdef")

router = APIRouter(prefix="/api/store", tags=["store"])


# ---------------------------------------------------------------------------
# Products
# ---------------------------------------------------------------------------

@router.get("/products", response_model=ProductListResponse)
async def list_products(
    category: Optional[str] = Query(None, description="Filter by category"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    """List all products. Public endpoint."""
    query = db.query(Product)
    if category:
        query = query.filter(Product.category.ilike(f"%{category}%"))

    total = query.count()
    products = query.offset(offset).limit(limit).all()
    return ProductListResponse(products=products, total=total)


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: UUID, db: Session = Depends(get_db)):
    """Get a single product. Public endpoint."""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# ---------------------------------------------------------------------------
# Orders & Stripe Checkout
# ---------------------------------------------------------------------------

@router.post("/create-checkout-session")
async def create_checkout_session(
    checkout_data: CheckoutSessionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        line_items = []
        total = 0.0
        order_items = []

        for item in checkout_data.items:
            product = db.query(Product).filter(Product.id == item.product_id).first()
            if not product:
                raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
            if product.stock < item.quantity:
                raise HTTPException(status_code=400, detail=f"Insufficient stock for {product.name}")

            line_total = product.price * item.quantity
            total += line_total
            order_items.append(
                OrderItem(
                    product_id=product.id,
                    quantity=item.quantity,
                    price=product.price,
                )
            )

            # Stripe expects amount in cents
            line_items.append({
                "price_data": {
                    "currency": "usd",
                    "product_data": {
                        "name": product.name,
                    },
                    "unit_amount": int(product.price * 100),
                },
                "quantity": item.quantity,
            })

        # Create Order in DB (status='pending')
        order = Order(
            user_id=current_user.id,
            total=round(total, 2),
            shipping_address=None,
            status="pending",
            items=order_items,
        )
        db.add(order)
        db.commit()
        db.refresh(order)

        # Create Stripe Checkout Session
        frontend_url = os.getenv("VITE_FRONTEND_URL", "http://localhost:5173")
        
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=line_items,
            mode="payment",
            success_url=f"{frontend_url}/order-success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/store",
            client_reference_id=str(order.id),
            shipping_address_collection={"allowed_countries": ["US", "CA", "GB", "AU"]},
        )

        # Update order with stripe session id
        order.stripe_session_id = session.id
        db.commit()

        return {"url": session.url}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/verify-session")
async def verify_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    try:
        session = stripe.checkout.Session.retrieve(session_id)
        if session.payment_status == "paid":
            order_id = session.client_reference_id
            order = db.query(Order).filter(Order.id == order_id).first()
            if order and order.status == "pending":
                order.status = "completed"
                # Save shipping address if available
                if session.shipping_details and session.shipping_details.address:
                    addr = session.shipping_details.address
                    address_str = f"{addr.line1}, {addr.city}, {addr.state} {addr.postal_code}, {addr.country}"
                    order.shipping_address = address_str
                
                # Decrease stock for items
                for item in order.items:
                    product = db.query(Product).filter(Product.id == item.product_id).first()
                    if product:
                        product.stock -= item.quantity
                
                db.commit()
                return {"status": "success", "order_id": order.id}
            elif order and order.status == "completed":
                return {"status": "success", "order_id": order.id, "message": "Already verified"}
        
        return {"status": "pending"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new order. Calculates total from product prices."""
    total = 0.0
    order_items = []

    for item in order_data.items:
        product = db.query(Product).filter(Product.id == item.product_id).first()
        if not product:
            raise HTTPException(
                status_code=404,
                detail=f"Product {item.product_id} not found",
            )
        if product.stock < item.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for {product.name}",
            )

        line_total = product.price * item.quantity
        total += line_total
        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                price=product.price,
            )
        )

        # Decrease stock
        product.stock -= item.quantity

    order = Order(
        user_id=current_user.id,
        total=round(total, 2),
        shipping_address=order_data.shipping_address,
        items=order_items,
    )
    db.add(order)
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders", response_model=list[OrderResponse])
async def list_my_orders(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List the authenticated user's orders."""
    orders = (
        db.query(Order)
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return orders


@router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get a single order. Users can only view their own."""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return order
