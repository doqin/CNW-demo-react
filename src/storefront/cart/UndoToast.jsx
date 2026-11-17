import { useEffect } from 'react';
import { useStore } from '../StorefrontProviders.jsx';

/**
 * "Đã xóa … · Hoàn tác" bar, shown right inside the cart (drawer and cart page)
 * so the undo sits next to the line that was removed.
 */
export function UndoToast() {
  const { lastRemoved, undoRemove, dismissUndo } = useStore();
  useEffect(() => {
    if (!lastRemoved) return;
    const timer = setTimeout(dismissUndo, 5000);
    return () => clearTimeout(timer);
  }, [lastRemoved, dismissUndo]);
  if (!lastRemoved) return null;
  return (
    <div className="undo-toast" role="status">
      <span>
        Đã xóa <strong>{lastRemoved.name}</strong> khỏi giỏ.
      </span>
      <button type="button" onClick={undoRemove}>
        Hoàn tác
      </button>
    </div>
  );
}
