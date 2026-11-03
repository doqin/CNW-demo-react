import { Icon } from './Icon.jsx';

export function QuantityPicker({ name, value, onIncrease, onDecrease }) {
  return <div className="quantity-picker" aria-label={`Số lượng ${name}`}>
    <button type="button" aria-label={`Giảm ${name}`} disabled={value === 1} onClick={onDecrease}><Icon name="minus" size={16}/></button>
    <output aria-label={`Số lượng chọn ${name}`}>{value}</output>
    <button type="button" aria-label={`Tăng ${name}`} disabled={value === 10} onClick={onIncrease}><Icon name="plus" size={16}/></button>
  </div>;
}
