"""
Minimal reproduction test harness for Issue #42: Coupon discount cache persistence
"""
import pytest
from cart import Cart, CartItem
from discount import get_default_discount_manager

def test_coupon_discount_persists_after_removal_defect():
    discount_mgr = get_default_discount_manager()
    cart = Cart(cart_id="cart_repro_1", user_id="user_123")
    cart.add_item(CartItem(item_id="prod_1", name="Wireless Headphones", price=100.0, quantity=1, category="electronics"))
    
    # 1. Apply coupon SAVE20 (20% off $100 -> $20 discount)
    success = cart.apply_coupon("SAVE20")
    assert success is True
    assert cart.discount_amount == 20.0
    assert cart.total == 80.0
    
    # 2. Remove coupon
    cart.remove_coupon()
    
    # In buggy code, cart.discount_amount incorrectly returns 20.0 instead of 0.0
    assert cart.discount_amount == 0.0, f"Defect reproduced! Cached discount persisted: {cart.discount_amount}"
    assert cart.total == 100.0
