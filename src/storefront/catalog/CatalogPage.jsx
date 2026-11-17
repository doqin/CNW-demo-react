import { useSearchParams } from 'react-router';
import { categories } from '../data/catalog.js';
import { ProductTile } from './ProductTile.jsx';
import { parseCatalogQuery, selectProducts } from './catalogQuery.js';
import { StoreIcon } from '../ui/Icons.jsx';
export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const query = parseCatalogQuery(params);
  const products = selectProducts(query);
  function update(key, value) {
    setParams(
      (current) => {
        const next = new URLSearchParams(current);
        const isDefault =
          (key === 'category' && value === 'all') || (key === 'sort' && value === 'featured');
        if (!value || isDefault) next.delete(key);
        else next.set(key, value);
        return next;
      },
      { replace: true },
    );
  }
  return (
    <div className="catalog-page wrap">
      <div className="page-intro">
        <h1 tabIndex={-1}>Menu OneSip</h1>
        <p>Từ món quen mỗi sáng đến chiếc bình đi cùng bạn.</p>
      </div>
      <div className="catalog-toolbar">
        <div className="category-tabs" role="group" aria-label="Nhóm sản phẩm">
          {categories.map((c) => (
            <button
              key={c.id}
              className={c.id === query.category ? 'selected' : ''}
              aria-pressed={c.id === query.category}
              onClick={() => update('category', c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>
        <label className="search-field">
          <StoreIcon name="search" size={19} />
          <input
            value={query.q}
            onChange={(e) => update('q', e.target.value)}
            placeholder="Tìm một món bạn thích…"
            aria-label="Tìm sản phẩm"
          />
          {query.q && (
            <button onClick={() => update('q', '')} aria-label="Xóa tìm kiếm">
              <StoreIcon name="close" size={16} />
            </button>
          )}
        </label>
      </div>
      <div className="catalog-meta">
        <span role="status">{products.length} món nhỏ cho ngày của bạn</span>
        <div>
          <label className="sort-label">
            <span className="sr-only">Sắp xếp</span>
            <select
              aria-label="Sắp xếp"
              value={query.sort}
              onChange={(e) => update('sort', e.target.value)}
            >
              <option value="featured">OneSip đề xuất</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
              <option value="name">Tên A–Z</option>
            </select>
          </label>
        </div>
      </div>
      {products.length ? (
        <div className="store-product-grid">
          {products.map((p) => (
            <ProductTile key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="empty-inline">
          <StoreIcon name="search" size={34} />
          <h2>Chưa tìm thấy ngụm này.</h2>
          <p>Thử một tên khác hoặc xem lại tất cả sản phẩm nhé.</p>
          <button className="os-button secondary" onClick={() => setParams({}, { replace: true })}>
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  );
}
