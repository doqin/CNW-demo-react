import { Link } from 'react-router';
import { StoreIcon } from './Icons.jsx';
export default function NotFoundPage({ order = false }) {
  return (
    <div className="empty-page wrap">
      <span className="empty-symbol">
        <StoreIcon name="leaf" size={38} />
      </span>
      <h1 tabIndex={-1}>{order ? 'Chưa tìm thấy đơn hàng.' : 'Đi một vòng, về OneSip nhé.'}</h1>
      <p>
        {order
          ? 'Chỉ đơn gần nhất trong phiên này được lưu. Bạn có thể bắt đầu một giỏ hàng mới.'
          : 'Trang bạn tìm không còn ở đây. Một món dễ chịu vẫn đang chờ bạn ở cửa hàng.'}
      </p>
      <Link className="os-button primary" to="/shop">
        Ghé cửa hàng <StoreIcon name="arrow" />
      </Link>
    </div>
  );
}
