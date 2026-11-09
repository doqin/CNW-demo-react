import { metricsStore } from '../features/render/metricsStore.js';

const rawSources = import.meta.glob('/src/lessons/*/*.{js,jsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
});

// Modules a lesson may import but students do not edit.
export const hostModules = import.meta.glob(
  [
    '/src/data/*.js',
    '/src/components/{Icon,ProductArt,QuantityPicker}.jsx',
    '/src/features/render/{RenderStats.jsx,metricsStore.js}',
  ],
  { eager: true },
);

function defineProject({ id, files, ...rest }) {
  const paths = files.map(name => `/src/lessons/${id}/${name}`);
  return {
    id,
    ...rest,
    files: paths,
    entry: `/src/lessons/${id}/App.jsx`,
    initialSources: Object.fromEntries(
      paths.map(path => [path, rawSources[path]]),
    ),
  };
}

export const projects = [
  defineProject({
    id: 'shop',
    title: 'Cửa hàng',
    topics: 'Props · State · Context',
    slides: 'Slide 15–30',
    files: [
      'ProductCard.jsx',
      'useQuantity.js',
      'CartContext.jsx',
      'CartPanel.jsx',
      'App.jsx',
    ],
    points: [
      'Props truyền dữ liệu vào ProductCard. useQuantity giữ số lượng riêng cho từng thẻ.',
      'useState trong CartProvider giữ giỏ hàng. Mọi component đọc cùng giá trị qua useCart.',
    ],
    steps: [
      'Tăng Bình nước lên 2, thêm vào giỏ, rồi thêm một Trà đào.',
      'Trong ProductCard.jsx đổi useQuantity() thành useQuantity(3): mọi thẻ bắt đầu từ 3.',
    ],
  }),
  defineProject({
    id: 'render',
    title: 'So sánh render',
    topics: 'React.memo',
    slides: 'Slide 38–42',
    files: ['SalesChart.jsx', 'App.jsx'],
    points: [
      'Cùng một component, cùng dữ liệu. memo có thể bỏ qua cập nhật khi props chưa đổi. Effect chỉ gửi số liệu sang bộ quan sát riêng.',
    ],
    steps: [
      'Bấm “Bắt đầu phép đo”, gõ từng ký tự react. Kết quả 5 / 0. Bấm “Đổi dữ liệu”: 6 / 1.',
      'Trong SalesChart.jsx đổi memo(SalesChart) thành SalesChart rồi đo lại: cả hai cùng tăng.',
    ],
    onRun: () => metricsStore.reset(),
  }),
];
