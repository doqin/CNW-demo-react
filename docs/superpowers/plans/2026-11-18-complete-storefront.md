# Complete Storefront Implementation Plan

> **Execution update — 18/11/2026:** Người dùng yêu cầu tên **OneSip**, triển khai một MVP trực tiếp, không tạo nhiều draft. Task 1 được thay bằng một hướng hình ảnh cuối cùng. Thêm QR chuyển khoản MBBank `0825730557` với số tiền chỉnh sửa được, tạo local bằng `qrcode`, và skeleton loading cho route/ảnh/QR. Tính năng đặt đơn vẫn là frontend; trạng thái chuyển khoản chờ xác nhận. Các cập nhật này được ưu tiên hơn phạm vi ban đầu.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. Nếu người dùng chọn làm qua subagent, dùng superpowers:subagent-driven-development thay thế.

**Goal:** Nâng demo thành cửa hàng frontend có UI/UX được đầu tư, mua hàng mẫu trọn luồng và giữ Playground React hoạt động.

**Architecture:** HashRouter chia storefront toàn màn hình và Playground ở `/learn`. Storefront sở hữu catalog/cart/checkout riêng; lesson giữ dataset, compiler và phép đo hiện tại. Lazy-load khu học React, mở rộng token/CSS sẵn có và dùng Motion cho chuyển động có vòng đời React.

**Tech Stack:** React 19.3.1, Vite 8.3.5, JavaScript, CSS thuần, React Router, Motion; Vitest/Testing Library và Playwright hiện có. Pin bản stable tương thích của hai dependency mới tại lúc triển khai; không nâng stack đang dùng.

**Spec:** [2026-11-18-complete-storefront-design.md](../specs/2026-11-18-complete-storefront-design.md). Đọc cả spec và plan trước khi thực thi.

**Status:** Đã triển khai MVP OneSip ngày 18/11/2026. Kết quả thực tế và giới hạn ở [báo cáo kiểm tra](../../onesip-verification.md); các checkbox chi tiết bên dưới là kế hoạch gốc. Không mở lại vòng duyệt draft.

**Cập nhật cuối:** người dùng chọn lại screenshot bản sáng ban đầu, giữ bố cục và màu đó. Bỏ phủ màu ảnh sản phẩm. QR chỉ xuất hiện trên biên nhận sau **Đặt hàng**, vẫn chỉnh số tiền được. Đã cho phép push `feat/complete-storefront`; `develop` giữ nguyên.

| Chặng triển khai | Kết quả |
| --- | --- |
| Hình ảnh và nền app | Một hướng cuối, 13 ảnh local, font local, route và Learn tách biệt |
| Home/catalog/detail | 12 sản phẩm, tìm/lọc/sắp xếp, chi tiết và hết hàng |
| Cart/checkout/QR/receipt | Persistence, validation, retry/abort, QR sau đặt hàng, chỉnh tiền |
| Motion và responsive | Skeleton, drawer, reveal, reduced motion; 6 viewport được kiểm |
| Xác minh | Lint/build, 34 unit/component, 12 E2E; review và sửa lỗi focus/storage |
| Bàn giao | Hướng dẫn, ảnh, tour và phép đo lab trong báo cáo kiểm tra |

## Global Constraints

- Làm việc trên nhánh riêng **`feat/complete-storefront`**, không push vào `develop`.
- Nhánh local đã tạo từ `main@57f3fcc`; `develop` và `origin/develop` giữ ở `5ce047c9bd03d73efa5de225fb2737a57f3180eb`. Remote hiện tại là `https://github.com/thqhuong/CNW-demo-react.git`; không dùng URL repo cũ trong README để push theo suy đoán.
- Giữ React/Vite/JavaScript/CSS thuần. Đề xuất thêm đúng hai runtime dependencies: **`react-router`** và **`motion`**.
- Storefront dùng catalog riêng; `src/data/products.js` của lesson giữ nguyên P01/P02/P03 và giá 50.000/25.000/10.000đ.
- Một dòng giỏ theo `productId`; số lượng nguyên **1..min(stock,99)**.
- Phí mẫu: 20.000đ nếu `0 < subtotal < 150.000đ`; miễn phí khi `subtotal >= 150.000đ`; giỏ trống phí 0.
- `totalQuantity` là tổng đơn vị, không phải số dòng. Giá, tổng và trạng thái hết hàng luôn suy ra từ catalog và cart; không lưu nhiều state tổng tiền.
- Checkout luôn ghi **“Đây là đơn hàng mô phỏng, không phát sinh thanh toán.”** Không yêu cầu thông tin thẻ.
- Ngôn ngữ UI/tài liệu tiếng Việt; tên component, API và commit tiếng Anh. Assets/font chạy local sau khi cài/build.
- Không đưa router/Motion vào compiler lesson, không bật React Compiler, không animate dữ liệu/bộ đếm phép so sánh `memo`.
- Không push, merge hoặc deploy trong lượt lập plan. Khi có yêu cầu push tiếp theo, chỉ push rõ tên nhánh `feat/complete-storefront`; không dùng lệnh push với đích `develop`.

## Review Focus

1. CSS lesson lazy-loaded vẫn có thể rò sang shop sau khi đi `/learn → shop`: task 2 và 10 kiểm khả năng cuộn, chiều cao và focus ở cả hai chiều.
2. Storage hỏng, schema cũ, stock 0, ID lạ, thao tác dồn dập: task 4 kiểm normalize, cap và fallback bộ nhớ.
3. Submit lặp, lỗi rồi thử lại, điều hướng khỏi checkout khi pending: task 7–8 kiểm một receipt/attempt, abort giữ giỏ và không success muộn.
4. Back/Forward, query tiếng Việt, deep link sai và refresh receipt: task 5/8/10 kiểm URL, scroll, state và đường thoát.
5. Motion bị ngắt, reduced motion, mobile keyboard và overlay focus: task 6/9/10 kiểm drawer, CTA sticky và khả năng thao tác.

## Bản đồ file và hợp đồng

Đường dẫn dưới đây tương đối với repo demo, không phải repo môn học.

| Cụm | File chính | Trách nhiệm |
| --- | --- | --- |
| Root | `src/App.jsx`, `src/main.jsx`, `src/styles.css`, `src/tokens.css` | Route, provider chung, reset nhẹ, token |
| Lesson | `src/features/learn/LearnApp.jsx`, `src/features/learn/learn.css` | App hiện tại chuyển vào, CSS scoped `.learn-app` |
| Shell | `src/storefront/StorefrontLayout.jsx`, `src/storefront/StorefrontProviders.jsx`, `src/storefront/storefront.css` | Header/footer, context, bố cục shop |
| Data | `src/storefront/data/catalog.js`, `src/storefront/data/catalog.test.js` | Catalog 12 sản phẩm, index ID/slug |
| Home | `src/storefront/home/HomePage.jsx` | Hero, nhóm hàng, tuyển chọn |
| Browse | `src/storefront/catalog/{CatalogPage,ProductTile}.jsx`, `src/storefront/catalog/catalogQuery.js`, `src/storefront/product/ProductPage.jsx` | Tìm/lọc/sắp xếp, gallery/detail |
| Cart | `src/storefront/cart/{cartModel,cartStorage}.js`, `src/storefront/cart/{StoreCartContext,CartDrawer,CartPage,OrderSummary}.jsx` | State giỏ, giới hạn, phí, lưu trữ, UI |
| Checkout | `src/storefront/checkout/{checkoutValidation,demoOrderService,receiptStorage}.js`, `src/storefront/checkout/{CheckoutPage,ConfirmationPage}.jsx` | Validation, mock order, receipt, giao diện |
| UI chung | `src/storefront/ui/{RouteFocus,NotFoundPage,ImageWithFallback}.jsx`, `src/storefront/motion.js` | Focus/scroll, ảnh fallback, motion tokens |
| Artifacts | `public/images/storefront/`, `public/fonts/`, `docs/design/storefront-selected.md`, `docs/design/asset-manifest.md` | Ảnh/font local, quyết định hình ảnh, nguồn/giấy phép |
| Checks | `tests/storefront.spec.js`, `tests/storefront-accessibility.spec.js`, `tests/demo.spec.js` | Luồng mua hàng, khả dụng, hồi quy seminar |

Kiểu dữ liệu bằng JSDoc, không đổi dự án sang TypeScript:

- `Product`: `{ id, slug, name, category, price, stock, description, specs, images, featured }`, đúng spec mục 6.
- `CartLine`: `{ productId: string, quantity: number }`; `CartQuote`: `{ totalQuantity, subtotal, shipping, total }`, đều số nguyên.
- `CheckoutDraft`: `{ fullName, phone, address, note }`, chỉ trong bộ nhớ.
- `Receipt`: `{ id, attemptId, createdAt, lines, subtotal, shipping, total, simulated: true }`; `lines` chứa snapshot `{ productId, name, unitPrice, quantity }`. Không chứa draft.
- `StorefrontProviders` giữ cart/draft/receipt sống qua route, kể cả khi xem `/learn`; editor/metrics không đọc cart. Component reset riêng trong Learn chỉ gọi action reset, không làm metrics subscribe giỏ.

## Task 1: Chốt thiết kế bằng hình có thể review

**Files:** tạo sau khi chọn `docs/design/storefront-selected.md`, `docs/design/asset-manifest.md`, ảnh ở `docs/images/storefront/`. Bản khám phá tạm để tại `%TEMP%/evon-design/` theo skill UI/UX.

**Consumes:** spec mục 3–5 và hiện trạng. **Produces:** bố cục được chọn, hi-fi Home/detail/checkout desktop + mobile, token và asset checklist.

- [ ] Đọc lại `ui-ux`/`redesign-existing-projects`; dựng 2–3 bố cục Home/catalog/detail khác thật, ghi ưu/đánh đổi, kiểm 375px và desktop. Dùng nội dung sản phẩm thật của spec.
- [ ] Cho người dùng xem và chọn từ wireframe; nếu họ đã giao tự quyết hoặc yêu cầu dựng luôn thì dùng A và ghi rõ đó là lựa chọn của agent, không mở lại cổng hỏi.
- [ ] Làm hi-fi Home/detail/checkout, empty cart và checkout error. Kiểm hierarchy, vị trí CTA, gallery, form và theme tối trước khi nhân rộng.
- [ ] Chốt ảnh hero + 12 ảnh sản phẩm: ảnh studio cùng ánh sáng, nền và góc chụp. Nếu cần tạo ảnh, đọc skill `imagegen` khi thực thi và dùng công cụ imagegen; không tạo ảnh trong lượt lập plan này.
- [ ] Ghi token/font/ảnh và nguồn giấy phép vào hai tài liệu. Kiểm dấu tiếng Việt của font local. Không cần tạo Figma file để hoàn tất chặng này.

**Nghiệm thu:** có hình desktop/mobile và layout được chọn; không chỉ có mô tả “premium”. Chưa đạt thì tiếp tục sửa art direction trước khi làm hàng loạt màn.

## Task 2: Route toàn màn hình và bảo toàn Playground

**Files:** sửa `package.json`, `package-lock.json`, `src/{App.jsx,main.jsx,styles.css}`, `src/App.test.jsx`, `tests/demo.spec.js`; tạo `src/features/learn/{LearnApp.jsx,learn.css}`, `src/storefront/{StorefrontLayout.jsx,StorefrontProviders.jsx,storefront.css}`, `src/storefront/ui/{RouteFocus,NotFoundPage}.jsx`.

**Consumes:** App cũ và routing trong spec. **Produces:** HashRouter với các route đã liệt kê, lazy LearnApp; storefront cuộn tự nhiên, lesson vẫn khung chia đôi.

- [ ] Viết regression route: root có heading cửa hàng, `/#/learn` có editor/preview, route sai có lối về catalog; sửa điểm vào test lesson mà không bỏ assertion 125.000đ, 5/0 và 6/1.
- [ ] Chạy `npx vitest run src/App.test.jsx` để quan sát phần kỳ vọng mới fail trước triển khai.
- [ ] Thêm/pin `react-router`; chuyển App cũ vào LearnApp và sửa import tương đối. Lazy-load qua `React.lazy`, không import `lessons/index.js` từ root. Tách theme root, giữ label/nút đổi theme trong Learn.
- [ ] Tách global reset khỏi CSS lesson. Scope selector `body/html/#root`, `.app`, `.workspace`, `h1`, `button` của lesson đúng boundary; không giữ `overflow:hidden` global. CSS lesson dù đã tải không được ảnh hưởng storefront.
- [ ] Định nghĩa route có heading và fallback dùng được trong lúc xây tiếp; thêm link cửa hàng ↔ React. `RouteFocus` xử lý heading focus/scroll theo navigation type, không cướp focus khi chỉ đổi query lọc.
- [ ] Chạy lại component tests, `npm run build`, các test desktop/mobile/keyboard/memo có sẵn với điểm vào mới; kiểm thủ công `Home → Learn → Home`.

**Nghiệm thu:** lesson vẫn sửa code/lỗi/reset được; shop không bị khung editor hoặc CSS cũ chặn cuộn. Commit đề xuất: `refactor(app): separate storefront and learning routes`.

## Task 3: Art direction, assets, catalog và Home

**Files:** sửa `src/tokens.css`, `src/storefront/storefront.css`, `index.html`, `public/favicon.svg`; tạo `src/storefront/data/{catalog.js,catalog.test.js}`, `src/storefront/home/HomePage.jsx`, `src/storefront/ui/ImageWithFallback.jsx`, assets/font theo task 1.

**Consumes:** bộ thiết kế task 1. **Produces:** `catalog`, `catalogById`, `catalogBySlug`, Home hoàn chỉnh, shell sáng/tối và ảnh local.

- [ ] Viết test catalog: 12 ID/slug duy nhất; P01/P02/P03 đúng giá cũ; stock integer 0..99; đúng ba category; ít nhất một mặt hàng stock 0; mọi image có alt/path/kích thước. `npx vitest run src/storefront/data/catalog.test.js` ban đầu fail vì module chưa có.
- [ ] Tạo catalog riêng theo spec; giữ nguyên `src/data/products.js`. Dùng lại `formatPrice` có sẵn hoặc tách helper dùng chung mà không đổi output `125.000 đ` của lesson.
- [ ] Đưa font/ảnh được chọn vào local và ghi giấy phép; triển khai `ImageWithFallback({src,alt,width,height,...props})` giữ tỷ lệ khi tải/lỗi. Tạo responsive image sizes và ưu tiên hero, lazy-load ảnh thấp hơn.
- [ ] Mở rộng token thay vì tạo palette thứ hai; làm shell/Home đúng layout task 1, category link mở catalog có filter, thẻ tuyển chọn mở đúng slug, logo về Home, footer dẫn tới React. Bỏ link chưa có đích.
- [ ] Kiểm screenshot Home ở 375/1440, sáng/tối; đo kích thước file theo budget spec. Home chưa có motion vẫn phải đủ sức thuyết phục.

**Nghiệm thu:** ảnh, dấu tiếng Việt, contrast và CTA tốt cả hai theme; toàn bộ ảnh/font từ local. Commit: `feat(storefront): establish visual identity and local catalog`.

## Task 4: Cart model và lưu trữ bền vững

**Files:** tạo `src/storefront/cart/{cartModel,cartStorage}.js`, `src/storefront/cart/StoreCartContext.jsx`, các file `.test.js`/`.test.jsx` cùng cụm; sửa `StorefrontProviders.jsx`.

**Interfaces:** `normalizeCart(raw, catalogById) -> CartLine[]`; `addCartItem(items, productId, quantity, catalogById) -> CartLine[]`; `setCartQuantity(items, productId, quantity, catalogById) -> CartLine[]`; `getCartQuote(items, catalogById) -> CartQuote`. `readCart(storage,catalogById) -> CartLine[]` và `writeCart(storage,items) -> boolean` dùng key `se347.storefront.cart.v1`, envelope `{version:1,items}`.

`useStoreCart()` trả `{items,quote,addItem,setQuantity,removeItem,clearCart}`; update bằng functional setter. `normalizeCart` bỏ ID lạ, quantity không phải safe integer dương và sản phẩm stock 0; gộp duplicate rồi cap stock/99; không đọc giá từ storage.

- [ ] Test ba fixture: giỏ rỗng tất cả 0; P01×2+P02×1 = subtotal125000/ship20000/total145000/quantity3; P01×3 =150000/0/150000. Test quantity=0/âm/lẻ/NaN, duplicate, stock0 và vượt cap.
- [ ] Test đọc JSON hỏng/version lạ và storage get/set ném lỗi; fallback cart bộ nhớ hoạt động. Test `addItem` liên tục không mất lần bấm, normalize không ghi giá cũ trở lại.
- [ ] Chạy `npx vitest run src/storefront/cart` để xác nhận test fail; triển khai model/storage/context đúng hợp đồng rồi chạy lại.
- [ ] Giữ draft và receipt state riêng trong providers; thêm `resetStorefront()` xóa cart/receipt/draft/attempt đúng key, giữ theme. Consumer reset ở Learn gọi được mà không dùng cart như đầu vào biểu đồ.

**Nghiệm thu:** refresh giữ giỏ đúng, lỗi storage không làm app trắng; không đổi CartContext lesson. Commit: `feat(cart): add validated cart state and persistence`.

## Task 5: Catalog và trang chi tiết sử dụng được

**Files:** tạo `src/storefront/catalog/{CatalogPage,ProductTile}.jsx`, `src/storefront/catalog/{catalogQuery.js,catalogQuery.test.js,CatalogPage.test.jsx}`, `src/storefront/product/{ProductPage.jsx,ProductPage.test.jsx}`; sửa routes và CSS storefront.

**Interfaces:** `parseCatalogQuery(searchParams) -> {q,category,sort,available}`; `selectProducts(catalog,query) -> Product[]`; `ProductTile({product,onAdd})`, `onAdd(productId,1)` nối `useStoreCart().addItem`. Detail dùng quantity local theo stock và `addItem(id,qty)`. Task 6 bổ sung callback `onItemAdded(productId)` để mở drawer sau cập nhật giỏ thành công.

- [ ] Test tìm `tra dao`/`TRÀ ĐÀO`/khoảng trắng/`đ`, lọc kết hợp, sort giá tăng/giảm và tên `vi`, query sai về mặc định; ít nhất một trường hợp không kết quả.
- [ ] Test detail slug đúng/sai, tên dài, ảnh fallback, giới hạn lượng và mặt hàng hết hàng khóa CTA; route sản phẩm hết hàng vẫn đọc được mô tả/giá.
- [ ] Chạy các test cụm catalog/product cho trạng thái đỏ; triển khai URL query, search không cướp focus, chips và sort. Với 12 sản phẩm hiển thị hết kết quả, không thêm pagination vô ích.
- [ ] Dựng detail desktop hai cột/mobile một cột, gallery dùng nút thumbnail có tên, specs đọc được, CTA sticky có safe-area và padding chừa chỗ.
- [ ] Nối thêm hàng thật và badge. Giữ query/scroll khi đi detail rồi Back; test refresh deep link và Forward. Khi đổi filter không phát animation delay làm chậm thao tác.

**Nghiệm thu:** mọi đường chọn món làm được từ Home lẫn URL trực tiếp; không nút thêm giả. Commit: `feat(catalog): complete browsing and product detail flows`.

## Task 6: Cart drawer và trang giỏ hoàn chỉnh

**Files:** tạo `src/storefront/cart/{CartDrawer,CartPage,OrderSummary}.jsx`, `src/storefront/cart/CartDrawer.test.jsx`; sửa header, product add handler, `storefront.css`, `tests/storefront-accessibility.spec.js`.

**Interfaces:** `CartDrawer({open,onClose,lastAddedProductId})`; `OrderSummary({quote,children})`; dùng cart context task 4 làm nguồn duy nhất. `StorefrontLayout` sở hữu state mở drawer và callback `onItemAdded(productId)`, truyền cho browse/detail qua Outlet context; callback không thêm hàng lần nữa. Add mở drawer và focus heading; badge header là nút có tên chứa số đơn vị.

- [ ] Test drawer bằng bàn phím: focus vào trong, Tab không ra nền, Escape đóng, trả focus trigger. Test empty, có hàng, xóa dòng cuối và sửa lượng tại cap.
- [ ] Dùng native `<dialog>` với `showModal()` và ref điều khiển; không trộn thuộc tính `open` với modal API. Nút X/overlay click có hành vi nhất quán; scroll nền được khóa đúng và khôi phục đúng vị trí.
- [ ] Dựng drawer/trang giỏ và `OrderSummary` dùng chung công thức; hiển thị phí trước checkout và số còn thiếu để miễn phí chỉ khi subtotal <150000. Hai CTA dẫn tới `/cart` và `/checkout` thật.
- [ ] Kiểm 375×812 và 1280×720: drawer cuộn bên trong, close/checkout luôn tới được; empty có CTA quay lại shop. Bấm thêm nhanh không gây hai dialog hay vượt cap.
- [ ] Chạy cart tests và `npx playwright test tests/storefront-accessibility.spec.js`; chưa thêm Motion trước khi focus/close hoạt động đúng.

**Nghiệm thu:** có thể thêm, kiểm, sửa, xóa, rời giỏ và tới checkout mà không kẹt focus. Commit: `feat(cart): add accessible drawer and cart page`.

## Task 7: Validation và mock order có retry/abort

**Files:** tạo `src/storefront/checkout/{checkoutValidation,demoOrderService,receiptStorage}.js`, các file test cùng tên.

**Interfaces:** `validateCheckout(draft) -> {valid,errors,normalized}` theo chính xác giới hạn spec; `placeDemoOrder({attemptId,items,draft}, {signal,scenario:'success'|'error'}) -> Promise<Receipt>`; `saveReceipt(storage,receipt) -> boolean`, `readReceipt(storage) -> Receipt|null` với key `se347.storefront.receipt.v1`, envelope version1 và tối đa một receipt.

Service lấy giá/stock từ catalog, tính lại quote task 4, xử lý 350ms; snapshot là dữ liệu bất biến. Một Map theo attemptId deduplicate cả promise đang pending và receipt đã tạo; lỗi/abort xóa promise lỗi khỏi Map để retry được. Với `scenario:'error'`, chỉ lần gọi đầu của mỗi attempt reject; retry cùng attempt và scenario thành công. Receipt không chứa thông tin giao hàng. Export thêm `resetDemoOrders()` để reset Map và bộ attempt lỗi khi `resetStorefront()` được gọi.

- [ ] Test tên 1/2/80/81 ký tự, điện thoại `0…`/`+84…` với whitespace/hyphen, địa chỉ 9/10/200/201 ký tự, note 300/301; chỉ form hợp lệ mới gọi service.
- [ ] Dùng fake timers kiểm cùng attempt gọi hai lần chỉ có một receipt; order snapshot/tổng không đổi khi cart bị clear sau đó. Scenario error reject lần đầu, retry cùng attempt và scenario tạo được đơn; reset xóa receipt và lịch sử attempt giả.
- [ ] Test AbortSignal trước và trong 350ms không tạo receipt, không clear cart; malformed/unknown-stock cart reject. Storage quota/schema hỏng được catch và không làm đơn thành công biến thành lỗi.
- [ ] Chạy `npx vitest run src/storefront/checkout` cho đỏ, triển khai rồi chạy xanh. ID receipt tạo từ `crypto.randomUUID()`; test kiểm quan hệ ID/attempt thay vì giá trị random cố định.

**Nghiệm thu:** đơn được tạo đúng một lần/attempt, lỗi hoặc abort giữ dữ liệu mua. Commit: `feat(checkout): add validated idempotent demo order service`.

## Task 8: Guest checkout, xác nhận và phục hồi

**Files:** tạo `src/storefront/checkout/{CheckoutPage,ConfirmationPage}.jsx`, `src/storefront/checkout/CheckoutPage.test.jsx`, `tests/storefront.spec.js`; sửa routes/providers và CSS storefront.

**Consumes:** cart, quote, mock service task 7, draft/receipt memory task 4. **Produces:** chuỗi hoàn chỉnh đến confirmation, refresh receipt hợp lệ và lần mua thứ hai.

- [ ] Viết E2E: Home → search → detail P01×2 → thêm P02×1 → cart 145.000đ → checkout → điền mẫu → đặt đơn → receipt 145.000đ, cart0; refresh receipt vẫn đúng và mua lần hai được.
- [ ] Viết component/E2E cho lỗi form focus field đầu, không submit giỏ rỗng, pending disable submit/sửa, double click tạo một đơn, scenario error giữ form/cart rồi retry; rời pending thì abort và không navigate thành công muộn.
- [ ] Dựng một trang guest checkout gọn; dữ liệu mẫu hư cấu, không field tài khoản/thẻ/coupon; summary rõ phí. Lưu draft trong provider memory, không lưu vào local/sessionStorage.
- [ ] Dùng ref khóa submit ngay trước setState và một attemptId cho mỗi lần thử. Success ghi receipt memory/session, clear cart, navigate confirmation; button chưa được mở lại cho đến khi chuyển xong. Cleanup AbortController khi rời trang, không clear cart trong cleanup.
- [ ] Confirmation hiển thị snapshot receipt, không tra lại giá hiện tại hoặc chứa draft; nếu ID khác receipt gần nhất thì hiện trạng thái không tìm thấy và CTA. Back vào checkout sau success được guard về giỏ.
- [ ] Chạy component checkout tests, build và `npx playwright test tests/storefront.spec.js` trên production preview mới.

**Nghiệm thu:** happy path, retry, abort, direct URL và reload đều có hành vi rõ ràng. Commit: `feat(checkout): complete guest order and confirmation flow`.

## Task 9: Motion và chất lượng hiển thị

**Files:** thêm/pin `motion` trong package/lockfile; tạo `src/storefront/motion.js`; sửa Home, ProductPage, ProductTile, CartDrawer, ConfirmationPage, token/CSS; bổ sung accessibility E2E.

**Interfaces:** export một cấu hình dùng chung `storeMotion` gồm easeOut/drawer và duration theo bảng spec mục 7; `MotionConfig reducedMotion="user"` chỉ bọc storefront, `useReducedMotion()` cho nhánh thay transform bằng opacity. Không phụ thuộc Motion+ hoặc API trả phí.

- [ ] Áp skill `animate` và đọc recipe tương ứng trước khi viết motion. CSS cho hover/press; Motion enter/exit, drawer và layout dòng giỏ. Không cài GSAP/Lenis/UI kit để giải quyết hiệu ứng nhỏ.
- [ ] Làm theo bảng timing của spec: hero280/stagger50, hover160, press120, detail200, drawer260, row exit160/layout180, success240ms. Content/CTA dùng được ngay; subtotal/badge đổi ngay, không đếm số chạy.
- [ ] Khi drawer exit bằng pointer, giữ modal và focus trap tới khi exit xong rồi `dialog.close()`; nếu bị mở lại giữa exit thì hủy close cũ. Khi keyboard close/open hoặc reduced motion, thao tác không đợi motion. Inactive content không lọt vào tab order.
- [ ] Thử mở/đóng nhanh, thêm/xóa dồn, đổi route giữa chuyển động. Kiểm reduced motion và fine-pointer gating bằng Playwright; không test cứng chính xác số millisecond render.
- [ ] Soi screenshot cả sáu viewport spec và hai theme: ảnh crop, tên dài, giá, alignment, focus, empty/error, sticky/mobile keyboard. Xem motion chậm 2–5 lần và trên thiết bị thật nếu có; sửa cảm giác thực tế thay vì coi easing đúng là đủ.

**Nghiệm thu:** ba điểm nhấn nhìn có chủ đích, không giật layout/che CTA; reduced motion hoàn thành cùng luồng. Commit: `feat(ui): polish storefront motion and responsive states`.

## Task 10: Kiểm tra toàn bộ và bàn giao demo mới

**Files:** sửa `README.md`, `docs/{demo-script,rehearsal,qa,slide-mapping,design-notes,verification}.md`, `scripts/record-demo.mjs`; thêm screenshot tại `docs/images/storefront/`, video `backup/storefront-tour.mp4`; giữ backup lesson cũ và ghi rõ chúng thuộc phiên bản nào. Sửa CI chỉ nếu cần chạy bộ test mới; workflow hiện đã có lint/test/build/E2E.

- [ ] Chạy từ repo đúng nhánh: `npm run lint`, `npm test`, `npm run build`, `npm run test:e2e`. Không gọi test pass nếu chỉ dùng dist hoặc preview cũ; script hiện `reuseExistingServer` nên cần xác minh server thực phục vụ dist vừa build.
- [ ] Thêm E2E chặn request ngoài localhost; kiểm đủ mua hàng và lazy `/learn` hoạt động offline. Trong network resource list, Home không tải chunk Sucrase trước khi vào Learn. Kiểm lại lesson 125.000đ, live-edit và memo5/0 →6/1.
- [ ] Chạy bộ failure modes ở Review Focus, các URL deep link, refresh và browser Back/Forward. Kiểm `Learn → shop` sau CSS đã tải, reset cửa hàng không đổi code, reset code không xóa cart/receipt.
- [ ] Lưu screenshot Home/catalog/detail/cart/checkout/confirmation desktop+mobile và dark-mode tiêu biểu; kiểm bằng mắt. Không cập nhật snapshot chỉ để bỏ qua lỗi. Kiểm bàn phím/reduced motion, target44px, contrast và drawer focus.
- [ ] Đo lab ba lần cùng thiết bị/network/viewport và ghi median cùng cấu hình vào verification; ghi giới hạn lab so với mục tiêu LCP/CLS/INP của spec. Nếu dùng thêm công cụ đo, chọn lúc thực thi và lưu command/config có thể lặp lại, không bịa điểm hiệu năng.
- [ ] Cập nhật kịch bản **5 phút**: 45s Home/catalog, 60s detail, 45s giỏ, 60s checkout/receipt, 75s mở React giải thích một cơ chế, 15s kết. Bản 7 phút bổ sung đủ Context/memo; diễn tập thật và điều chỉnh nếu vượt giờ.
- [ ] Quay video từ app đã qua kiểm tra, cập nhật README chỉ rõ frontend mô phỏng, nguồn assets, cách reset và giới hạn lưu receipt. Không ghi nhận đã nộp hoặc trình bày seminar nếu không có bằng chứng mới.
- [ ] Kiểm `git diff --check`, diff toàn nhánh và branch hiện tại. Bàn giao kết quả trên `feat/complete-storefront`; không push/merge vào `develop`. Nếu được yêu cầu push sau đó, xác minh `git remote -v` và dùng `git push -u origin feat/complete-storefront` rõ đích.

**Nghiệm thu cuối:** mọi checkbox chức năng/visual/motion/lesson trong spec đạt hoặc có lỗi chặn được nêu rõ; có video mới và báo cáo kiểm tra thực tế. Commit: `docs(demo): refresh storefront rehearsal and verification`.

## Thứ tự thực thi và điểm review

`1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10`.

- Sau task1: review hình, token và asset direction; đây là lúc sửa gu/bố cục rẻ nhất.
- Sau task3: Home phải có chất lượng hình ảnh đã chọn; chưa đạt thì sửa trước khi nhân rộng card.
- Sau task8: luồng mua hàng hoàn chỉnh, chưa được bỏ task9 vì motion/polish là yêu cầu của người dùng.
- Sau task10: bàn giao bản trình diễn được; không gộp yêu cầu backend/deploy vào đường hoàn thành.

Đề xuất thực thi trực tiếp từng task trong cùng nhánh để giữ nhất quán art direction và các context; dùng reviewer ở điểm review lớn nếu được chọn. Không mặc định phân công lại năm thành viên nhóm. Ước lượng tổng **24–48 giờ** theo spec, điều chỉnh sau khi chọn thiết kế và kiểm asset.
