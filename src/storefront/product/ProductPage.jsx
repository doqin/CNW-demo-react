import { useState } from 'react';
import { Link, useParams, useOutletContext } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { catalog, catalogBySlug, formatPrice } from '../data/catalog.js';
import { useStore } from '../StorefrontProviders.jsx';
import { ImageWithFallback } from '../ui/ImageWithFallback.jsx';
import { StoreIcon } from '../ui/Icons.jsx';
import NotFoundPage from '../ui/NotFoundPage.jsx';
import { QuantityControl } from '../cart/QuantityControl.jsx';
import { ProductTile } from '../catalog/ProductTile.jsx';
function ProductDetails({ product }) {
  const [qty, setQty] = useState(1);
  const { addItem, pending } = useStore();
  const { onItemAdded } = useOutletContext();
  const reduce = useReducedMotion();
  const related = catalog
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);
  return (
    <div className="product-page wrap">
      <nav className="breadcrumbs" aria-label="Đường dẫn">
        <Link to="/shop">Cửa hàng</Link>
        <StoreIcon name="chevron" size={12} />
        <span>{product.name}</span>
      </nav>
      <motion.div
        className="product-detail"
        initial={{ opacity: 0, transform: reduce ? 'none' : 'translateY(8px)' }}
        animate={{ opacity: 1, transform: 'translateY(0px)' }}
        transition={{ duration: 0.2 }}
      >
        <div className={`detail-visual tone-${product.tone}`}>
          <ImageWithFallback src={product.image} alt={product.name} priority />
          <span className="detail-image-caption">ONESIP ESSENTIALS / {product.id}</span>
        </div>
        <div className="detail-copy">
          <h1 tabIndex={-1}>{product.name}</h1>
          <p className="detail-tagline">{product.detail}</p>
          <p className="detail-price">{formatPrice(product.price)}</p>
          <span className={`stock-label ${product.stock ? '' : 'sold-out'}`}>
            <span />
            {product.stock ? 'Sẵn sàng cho giỏ của bạn' : 'Tạm hết hàng'}
          </span>
          <p className="detail-description">{product.description}</p>
          <div className="product-spec">
            <span>Một chút thông tin</span>
            <strong>{product.spec}</strong>
          </div>
          <div className="purchase-actions">
            <QuantityControl
              name={product.name}
              value={qty}
              max={Math.min(99, product.stock)}
              onChange={setQty}
              disabled={!product.stock || pending}
            />
            <button
              className="os-button primary"
              disabled={!product.stock || pending}
              onClick={(event) => {
                addItem(product.id, qty);
                onItemAdded(product.id, event.detail === 0);
              }}
            >
              {product.stock ? 'Thêm vào giỏ' : 'Hẹn bạn lần tới'}
              <StoreIcon name="bag" size={18} />
            </button>
          </div>
          <div className="detail-promises">
            <span>
              <StoreIcon name="truck" size={18} /> Giao hàng 20.000 đ · Miễn phí từ 150.000 đ
            </span>
            <span>
              <StoreIcon name="leaf" size={18} /> Một lựa chọn nhỏ, cho ngày thêm dễ chịu.
            </span>
          </div>
        </div>
      </motion.div>
      {related.length > 0 && (
        <section className="related-section">
          <div className="section-heading">
            <h2>
              Có thể bạn cũng <em>thích.</em>
            </h2>
            <Link className="text-link" to="/shop">
              Xem tất cả <StoreIcon name="arrow" size={18} />
            </Link>
          </div>
          <div className="store-product-grid related-grid">
            {related.map((p) => (
              <ProductTile key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
export default function ProductPage() {
  const { slug } = useParams();
  const product = catalogBySlug[slug];
  return product ? <ProductDetails key={slug} product={product} /> : <NotFoundPage />;
}
