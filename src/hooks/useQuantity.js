import { useState } from 'react';

// demo:start quantity-hook
export function useQuantity(initial = 1, max = 10) {
  const [qty, setQty] = useState(initial);
  const increase = () => setQty(q => Math.min(max, q + 1));
  const decrease = () => setQty(q => Math.max(1, q - 1));
  return { qty, increase, decrease };
}
// demo:end quantity-hook
