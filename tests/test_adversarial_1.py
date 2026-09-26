import pytest
from cart import Cart, CartItem

def test_adversarial_rapid_flapping():
    cart = Cart("cart_adv_1", "user_adv_1")
    cart.add_item(CartItem("item_1", "Laptop", 1000.0, 1, "electronics"))
    
    # Flap 1
    assert cart.apply_coupon("SAVE20") is True
    assert cart.discount_amount == 200.0
    cart.remove_coupon()
    assert cart.discount_amount == 0.0
    
    # Flap 2
    assert cart.apply_coupon("TECH50") is True
    assert cart.discount_amount == 500.0
    cart.remove_coupon()
    assert cart.discount_amount == 0.0
