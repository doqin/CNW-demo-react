export function PageSkeleton() {
  return (
    <div className="page-skeleton wrap" role="status" aria-label="Đang tải trang">
      <span className="sr-only">Đang chuẩn bị một chút dễ chịu…</span>
      <div className="skeleton sk-eyebrow" />
      <div className="skeleton sk-title" />
      <div className="skeleton sk-description" />
      <div className="skeleton-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i}>
            <div className="skeleton sk-photo" />
            <div className="skeleton sk-line" />
            <div className="skeleton sk-price" />
          </div>
        ))}
      </div>
    </div>
  );
}
