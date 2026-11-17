import { Link, useOutletContext } from 'react-router';
import { useStore } from '../StorefrontProviders.jsx';
import { formatPrice } from '../data/catalog.js';
import { ImageWithFallback } from '../ui/ImageWithFallback.jsx';
import { StoreIcon } from '../ui/Icons.jsx';
import { motion, useReducedMotion } from 'motion/react';
export function ProductTile({ product, layout = 'grid', order = 0 }) {
  const { addItem, pending } = useStore();
  const { onItemAdded } = useOutletContext();
  const reduce = useReducedMotion();
  return (
    <motion.article
      className={`product-tile ${layout === 'menu' ? 'menu-item' : ''}`}
      aria-label={product.name}
      initial={reduce ? false : { opacity: 0, transform: 'translateY(16px)' }}
      whileInView={{ opacity: 1, transform: 'translateY(0px)' }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.28, delay: reduce ? 0 : Math.min(order % 4, 3) * 0.06 }}
    >
      <div className="tile-visual">
        <Link
          className="tile-image-link"
          to={`/products/${product.slug}`}
          aria-label={`Xem ${product.name}`}
        >
          <ImageWithFallback
            src={product.image}
            srcSet={`${product.thumbnail} 400w, ${product.image} 800w`}
            sizes="(max-width:639px) 45vw, (max-width:1199px) 30vw, 290px"
            alt={product.name}
          />
        </Link>
        {product.stock === 0 && <span className="tile-tag">Tạm hết</span>}
        <button
          className="quick-add"
          disabled={!product.stock || pending}
          aria-label={`Thêm ${product.name} vào giỏ`}
          onClick={(event) => {
            addItem(product.id, 1);
            onItemAdded(product.id, event.detail === 0);
          }}
        >
          <StoreIcon name="plus" size={20} />
        </button>
      </div>
      <div className="tile-info">
        <div>
          <h3>
            <Link to={`/products/${product.slug}`}>{product.name}</Link>
          </h3>
          <p>{product.spec.split(' · ')[0]}</p>
          {layout === 'menu' && <p className="menu-description">{product.detail}</p>}
        </div>
        <span className="tile-price">{formatPrice(product.price)}</span>
      </div>
    </motion.article>
  );
}
