"""
REBUG Autonomous Regression & Boundary Test Suite
"""
import pytest
from cart import Cart, CartItem
from discount import get_default_discount_manager, COUPONS

def test_apply_and_remove_coupon_boundary():
    cart = Cart(cart_id="cart_gen_1", user_id="user_test")
    cart.add_item(CartItem(item_id="item_1", name="Shirt", price=30.0, quantity=1, category="apparel"))
    
    # Apply SAVE10 (10% off $30 -> $3.0)
    assert cart.apply_coupon("SAVE10") is True
    assert cart.discount_amount == 3.0
    assert cart.total == 27.0
    
    # Remove coupon
    cart.remove_coupon()
    assert cart.discount_amount == 0.0
    assert cart.total == 30.0

def test_zero_discount_without_coupon():
    cart = Cart(cart_id="cart_gen_2", user_id="user_test_2")
    cart.add_item(CartItem(item_id="item_2", name="Book", price=15.0, quantity=1))
    assert cart.discount_amount == 0.0
    assert cart.total == 15.0

def test_coupon_min_spend_boundary():
    cart = Cart(cart_id="cart_gen_3", user_id="user_test_3")
    cart.add_item(CartItem(item_id="item_3", name="Sticker", price=10.0, quantity=1))
    # SAVE20 requires $50 min spend
    assert cart.apply_coupon("SAVE20") is False
    assert cart.discount_amount == 0.0
