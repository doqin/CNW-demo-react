import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router';
import { StorefrontProviders, useStore } from './storefront/StorefrontProviders.jsx';
import { StorefrontLayout } from './storefront/StorefrontLayout.jsx';
import { PageSkeleton } from './storefront/ui/PageSkeleton.jsx';
import NotFoundPage from './storefront/ui/NotFoundPage.jsx';
const Home = lazy(() => import('./storefront/home/HomePage.jsx'));
const Catalog = lazy(() => import('./storefront/catalog/CatalogPage.jsx'));
const Product = lazy(() => import('./storefront/product/ProductPage.jsx'));
const Cart = lazy(() => import('./storefront/cart/CartPage.jsx'));
const Checkout = lazy(() => import('./storefront/checkout/CheckoutPage.jsx'));
const Confirmation = lazy(() => import('./storefront/checkout/ConfirmationPage.jsx'));
const Group = lazy(() => import('./storefront/group/GroupPage.jsx'));
const Learn = lazy(() => import('./features/learn/LearnApp.jsx'));
function LearningRoute() {
  const { theme, toggleTheme, resetStorefront } = useStore();
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Learn theme={theme} onToggleTheme={toggleTheme} onResetStorefront={resetStorefront} />
    </Suspense>
  );
}
function Page({ children }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}
export default function App() {
  return (
    <HashRouter>
      <StorefrontProviders>
        <Routes>
          <Route path="learn" element={<LearningRoute />} />
          <Route element={<StorefrontLayout />}>
            <Route
              index
              element={
                <Page>
                  <Home />
                </Page>
              }
            />
            <Route
              path="shop"
              element={
                <Page>
                  <Catalog />
                </Page>
              }
            />
            <Route
              path="products/:slug"
              element={
                <Page>
                  <Product />
                </Page>
              }
            />
            <Route
              path="cart"
              element={
                <Page>
                  <Cart />
                </Page>
              }
            />
            <Route
              path="checkout"
              element={
                <Page>
                  <Checkout />
                </Page>
              }
            />
            <Route
              path="group"
              element={
                <Page>
                  <Group />
                </Page>
              }
            />
            <Route
              path="orders/:orderId"
              element={
                <Page>
                  <Confirmation />
                </Page>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </StorefrontProviders>
    </HashRouter>
  );
}
