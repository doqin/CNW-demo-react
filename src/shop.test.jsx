import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CartProvider, useCart } from './context/CartContext.jsx';
import { useQuantity } from './hooks/useQuantity.js';

function Quantity({ id }) {
  const { qty, increase, decrease } = useQuantity();
  return <div>
    <output data-testid={id}>{qty}</output>
    <button onClick={increase}>increase {id}</button>
    <button onClick={decrease}>decrease {id}</button>
  </div>;
}

function CartHarness() {
  const { items, totalQuantity, totalPrice, addItem, removeItem } = useCart();
  return <div>
    <output data-testid="quantity">{totalQuantity}</output>
    <output data-testid="price">{totalPrice}</output>
    <output data-testid="lines">{items.length}</output>
    <button onClick={() => addItem('P01', 2)}>add bottle</button>
    <button onClick={() => addItem('P02', 1)}>add tea</button>
    <button onClick={() => { addItem('P01', 2); addItem('P01', 2); }}>add twice</button>
    <button onClick={() => removeItem('P01')}>remove bottle</button>
    <button onClick={() => removeItem('P02')}>remove tea</button>
  </div>;
}

describe('local quantities', () => {
  it('starts at one, stays independent and clamps to one through ten', () => {
    render(<><Quantity id="a" /><Quantity id="b" /></>);
    expect(screen.getByTestId('a')).toHaveTextContent('1');
    fireEvent.click(screen.getByText('increase a'));
    expect(screen.getByTestId('a')).toHaveTextContent('2');
    expect(screen.getByTestId('b')).toHaveTextContent('1');
    for (let n = 0; n < 20; n++) fireEvent.click(screen.getByText('increase a'));
    expect(screen.getByTestId('a')).toHaveTextContent(/^10$/);
    for (let n = 0; n < 20; n++) fireEvent.click(screen.getByText('decrease a'));
    expect(screen.getByTestId('a')).toHaveTextContent(/^1$/);
  });
});

describe('shared cart', () => {
  it('shows the seminar totals and removes complete lines back to an empty cart', () => {
    render(<CartProvider><CartHarness /></CartProvider>);
    expect(screen.getByTestId('price')).toHaveTextContent(/^0$/);
    fireEvent.click(screen.getByText('add bottle'));
    fireEvent.click(screen.getByText('add tea'));
    expect(screen.getByTestId('quantity')).toHaveTextContent(/^3$/);
    expect(screen.getByTestId('price')).toHaveTextContent('125000');
    expect(screen.getByTestId('lines')).toHaveTextContent(/^2$/);
    fireEvent.click(screen.getByText('remove bottle'));
    expect(screen.getByTestId('price')).toHaveTextContent('25000');
    expect(screen.getByTestId('quantity')).toHaveTextContent(/^1$/);
    fireEvent.click(screen.getByText('remove tea'));
    expect(screen.getByTestId('price')).toHaveTextContent(/^0$/);
    expect(screen.getByTestId('lines')).toHaveTextContent(/^0$/);
  });

  it('accumulates rapid additions against the latest state and merges matching IDs', () => {
    render(<CartProvider><CartHarness /></CartProvider>);
    fireEvent.click(screen.getByText('add twice'));
    expect(screen.getByTestId('quantity')).toHaveTextContent(/^4$/);
    expect(screen.getByTestId('price')).toHaveTextContent('200000');
    expect(screen.getByTestId('lines')).toHaveTextContent(/^1$/);
  });
});
