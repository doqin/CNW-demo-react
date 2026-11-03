import { products } from '../../data/products.js';
import { ProductCard } from '../../components/ProductCard.jsx';
import { CartPanel } from '../../components/CartPanel.jsx';
import { CodeDialog } from '../../components/CodeDialog.jsx';
import { shopExamples } from '../../teaching/codeExamples.js';

export function ShopView() {
  return <section aria-labelledby="shop-heading">
    <div className="view-heading"><div><h1 id="shop-heading">Một cửa hàng. Ba cơ chế React.</h1><p>Chọn số lượng, thêm vào giỏ và quan sát giao diện thay đổi.</p></div><CodeDialog examples={shopExamples}/></div>
    <div className="shop-layout"><div className="product-grid">{products.map(product => <ProductCard key={product.id} {...product}/>)}</div><CartPanel/></div>
    <div className="lesson-strip"><span className="lesson-index">01—02</span><div><strong>Mỗi thẻ giữ số lượng riêng. Giỏ hàng dùng chung state.</strong><span>Tăng Bình nước lên 2, thêm vào giỏ rồi thêm một Trà đào.</span></div><span className="lesson-tag">Props · State · Context</span></div>
  </section>;
}
