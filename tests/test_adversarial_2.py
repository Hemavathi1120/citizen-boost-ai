import pytest
from cart import Cart, CartItem

def test_adversarial_category_isolation():
    cart = Cart("cart_adv_2", "user_adv_2")
    cart.add_item(CartItem("item_apparel", "Shoes", 200.0, 1, "apparel"))
    
    # TECH50 is restricted to electronics category
    cart.apply_coupon("TECH50")
    assert cart.discount_amount == 0.0
    
    cart.remove_coupon()
    assert cart.discount_amount == 0.0
