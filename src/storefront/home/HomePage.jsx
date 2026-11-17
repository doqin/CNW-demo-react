import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { catalog } from '../data/catalog.js';
import { ProductTile } from '../catalog/ProductTile.jsx';
import { ImageWithFallback } from '../ui/ImageWithFallback.jsx';
import { StoreIcon } from '../ui/Icons.jsx';
import { storeMotion } from '../motion.js';
import { SipSuggestion } from './SipSuggestion.jsx';

export default function HomePage() {
  const reduce = useReducedMotion();
  return (
    <>
      <section className="home-hero wrap">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, transform: reduce ? 'none' : 'translateY(12px)' }}
          animate={{ opacity: 1, transform: 'translateY(0px)' }}
          transition={{ duration: reduce ? 0.12 : 0.28, ease: storeMotion.ease }}
        >
          <p className="eyebrow">
            <span className="little-spark">✳</span> MỘT KHOẢNG NGHỈ CHO RIÊNG BẠN
          </p>
          <h1 tabIndex={-1}>
            Một ngụm nhỏ.
            <br />
            Ngày <em>thêm xanh.</em>
          </h1>
          <p className="hero-description">
            Thức uống bạn thích. Chiếc bình mang theo.
            <br className="desktop-break" /> Những điều nhỏ làm một ngày dễ chịu hơn.
          </p>
          <div className="hero-actions">
            <Link className="os-button primary" to="/shop">
              Chọn món <StoreIcon name="arrow" />
            </Link>
            <span className="hero-note">
              Chậm lại một chút,
              <br />
              thưởng thức nhiều hơn.
            </span>
          </div>
          <div className="hero-footnote">
            <span className="mini-leaf">
              <StoreIcon name="leaf" size={19} />
            </span>
            <span>Đơn giản. Tươi mới. Đủ đầy.</span>
          </div>
        </motion.div>
        <div className="hero-art">
          <ImageWithFallback
            src="/images/storefront/hero.webp"
            alt="Bình nước xanh sage, trà đào và cà phê trong nắng sớm OneSip"
            priority
            width="1536"
            height="1024"
          />
          <div className="hero-stamp">
            made for
            <br />
            <em>your everyday.</em>
            <span>ONESIP / EST. 2026</span>
          </div>
          <span className="hero-image-index">01 — NHỮNG ĐIỀU NHỎ</span>
        </div>
      </section>
      <div className="ritual-strip wrap">
        <span>Đi tìm ngụm yêu thích của bạn</span>
        <Link to="/shop?category=drinks">
          Trà & thức uống <StoreIcon name="arrow" size={17} />
        </Link>
        <Link to="/shop?category=coffee">
          Một chút cà phê <StoreIcon name="arrow" size={17} />
        </Link>
        <Link to="/shop?category=accessories">
          Mang theo mỗi ngày <StoreIcon name="arrow" size={17} />
        </Link>
      </div>
      <SipSuggestion />
      <section className="featured-section wrap">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE EVERYDAY EDIT</p>
            <h2>
              Một chút dễ chịu, <em>được chọn cho bạn.</em>
            </h2>
          </div>
          <Link className="text-link" to="/shop">
            Xem tất cả <StoreIcon name="arrow" size={18} />
          </Link>
        </div>
        <div className="store-product-grid">
          {catalog
            .filter((product) => product.featured)
            .map((product, index) => (
              <ProductTile key={product.id} product={product} order={index} />
            ))}
        </div>
      </section>
      <section className="slow-note wrap">
        <span className="slow-note-mark">✳</span>
        <p>
          Không cần đợi một dịp đặc biệt
          <br />
          để dành cho mình <em>một điều dễ chịu.</em>
        </p>
        <Link className="text-link" to="/shop">
          Tìm ngụm của bạn <StoreIcon name="arrow" size={18} />
        </Link>
      </section>
    </>
  );
}
