import { createContext, useContext, useState } from 'react';
import { productById } from '../../data/products.js';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + productById[item.productId].price * item.quantity,
    0,
  );
  const addItem = (productId, quantity) =>
    setItems(current => mergeItem(current, productId, quantity));
  const removeItem = productId =>
    setItems(current => current.filter(item => item.productId !== productId));

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, totalQuantity, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

function mergeItem(items, productId, quantity) {
  if (
    !productById[productId] ||
    !Number.isSafeInteger(quantity) ||
    quantity < 1
  )
    return items;
  return items.some(item => item.productId === productId)
    ? items.map(item =>
        item.productId === productId
          ? { ...item, quantity: item.quantity + quantity }
          : item,
      )
    : [...items, { productId, quantity }];
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
