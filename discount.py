"""
Discount management module for e-commerce checkout.
"""
from typing import Dict, List, Optional, Any

COUPONS: Dict[str, Dict[str, Any]] = {
    "SAVE10": {"discount_percent": 10.0, "min_spend": 20.0, "category": None},
    "SAVE20": {"discount_percent": 20.0, "min_spend": 50.0, "category": None},
    "TECH50": {"discount_percent": 50.0, "min_spend": 100.0, "category": "electronics"},
}

class DiscountManager:
    _instance: Optional['DiscountManager'] = None

    def __init__(self):
        self._active_coupons: Dict[str, str] = {}
        self._cart_discount_cache: Dict[str, float] = {}

    def apply_coupon(self, cart_id: str, coupon_code: str, subtotal: float) -> bool:
        code_upper = coupon_code.upper()
        if code_upper not in COUPONS:
            return False

        coupon = COUPONS[code_upper]
        if subtotal < coupon["min_spend"]:
            return False

        self._active_coupons[cart_id] = code_upper
        discount_amount = round(subtotal * (coupon["discount_percent"] / 100.0), 2)
        self._cart_discount_cache[cart_id] = discount_amount
        return True

    def remove_coupon(self, cart_id: str) -> None:
        """
        Removes active coupon from the cart and atomically purges cached discount calculations.
        """
        if cart_id in self._active_coupons:
            del self._active_coupons[cart_id]
        if cart_id in self._cart_discount_cache:
            del self._cart_discount_cache[cart_id]

    def get_discount_for_cart(self, cart_id: str, items: List[Any]) -> float:
        """
        Returns the computed discount for a cart, ensuring active coupon presence.
        """
        coupon_code = self._active_coupons.get(cart_id)
        if not coupon_code or coupon_code not in COUPONS:
            if cart_id in self._cart_discount_cache:
                del self._cart_discount_cache[cart_id]
            return 0.0

        coupon = COUPONS[coupon_code]
        category = coupon.get("category")
        eligible_subtotal = 0.0
        for item in items:
            if category is None or getattr(item, 'category', None) == category:
                eligible_subtotal += item.line_total

        discount = round(eligible_subtotal * (coupon["discount_percent"] / 100.0), 2)
        self._cart_discount_cache[cart_id] = discount
        return discount

_global_discount_manager = DiscountManager()

def get_default_discount_manager() -> DiscountManager:
    return _global_discount_manager
