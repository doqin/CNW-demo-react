import productSource from '../components/ProductCard.jsx?raw';
import cartSource from '../context/CartContext.jsx?raw';
import headerSource from '../components/ShopHeader.jsx?raw';
import chartSource from '../features/render/SalesChart.jsx?raw';
import { extractRegion } from './extractRegion.js';

export const shopExamples = [
  {
    id: 'props-state', title: 'Props và state', slides: 'Slide 17, 21, 26',
    takeaway: 'Props truyền dữ liệu vào. useQuantity giữ số lượng riêng. Thành tiền được tính ngay khi render.',
    sections: [{ file: 'src/components/ProductCard.jsx', code: extractRegion(productSource, 'product-state') }],
  },
  {
    id: 'context', title: 'Context giỏ hàng', slides: 'Slide 15, 28, 30',
    takeaway: 'useState trong Provider giữ giỏ hàng. Các component đọc cùng giá trị qua useCart.',
    sections: [
      { file: 'src/context/CartContext.jsx', code: extractRegion(cartSource, 'cart-provider') },
      { file: 'src/components/ShopHeader.jsx', code: extractRegion(headerSource, 'cart-consumer') },
    ],
  },
];

export const renderExamples = [{
  id: 'memo', title: 'Trước và sau memo', slides: 'Slide 38–42',
  takeaway: 'Cùng một component, cùng dữ liệu. memo có thể bỏ qua cập nhật khi props chưa đổi. Effect chỉ gửi số liệu sang bộ quan sát riêng.',
  sections: [{ file: 'src/features/render/SalesChart.jsx', code: extractRegion(chartSource, 'memo-chart') }],
}];
