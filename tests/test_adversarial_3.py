import pytest
from cart import Cart
from discount import get_default_discount_manager

def test_adversarial_empty_cart_resilience():
    discount_mgr = get_default_discount_manager()
    discount = discount_mgr.get_discount_for_cart("non_existent_cart", [])
    assert discount == 0.0
    
    # Remove on non-existent cart should not raise KeyError
    discount_mgr.remove_coupon("non_existent_cart")
