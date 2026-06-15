import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem("cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // item: { productId, name, price, qty, category, notes?, preferredDate? }
  const addToCart = (item) => {
    setCart((prev) => {
      // For services with notes, always add as a new line item (don't merge)
      if (item.category === "service") {
        return [...prev, { ...item, cartItemId: `${item.productId}-${Date.now()}` }];
      }

      // For products, merge with existing item (increase qty)
      const existing = prev.find((i) => i.productId === item.productId && i.category !== "service");
      if (existing) {
        return prev.map((i) =>
          i.cartItemId === existing.cartItemId ? { ...i, qty: i.qty + item.qty } : i
        );
      }
      return [...prev, { ...item, cartItemId: `${item.productId}-${Date.now()}` }];
    });
  };

  const updateQty = (cartItemId, qty) => {
    if (qty < 1) return;
    setCart((prev) => prev.map((i) => (i.cartItemId === cartItemId ? { ...i, qty } : i)));
  };

  const removeFromCart = (cartItemId) => {
    setCart((prev) => prev.filter((i) => i.cartItemId !== cartItemId));
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQty, removeFromCart, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};