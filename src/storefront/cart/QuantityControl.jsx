import { StoreIcon } from '../ui/Icons.jsx';
export function QuantityControl({ name, value, max, onChange, disabled = false }) {
  return (
    <div className="os-quantity" role="group" aria-label={`Số lượng ${name}`}>
      <button
        aria-label={`Giảm ${name}`}
        disabled={disabled || value <= 1}
        onClick={() => onChange(value - 1)}
      >
        <StoreIcon name="minus" size={16} />
      </button>
      <output aria-label={`Số lượng chọn ${name}`}>{value}</output>
      <button
        aria-label={`Tăng ${name}`}
        disabled={disabled || value >= max}
        onClick={() => onChange(value + 1)}
      >
        <StoreIcon name="plus" size={16} />
      </button>
    </div>
  );
}
