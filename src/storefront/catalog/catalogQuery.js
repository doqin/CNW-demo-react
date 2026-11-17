import { catalog, categories } from '../data/catalog.js';
import { removeDiacritics } from '../utils/text.js';
const fold = (value) => removeDiacritics(value || '').toLowerCase().trim();
export function parseCatalogQuery(params) {
  return {
    q: params.get('q') || '',
    category: categories.some((c) => c.id === params.get('category'))
      ? params.get('category')
      : 'all',
    sort: ['featured', 'price-asc', 'price-desc', 'name'].includes(params.get('sort'))
      ? params.get('sort')
      : 'featured',
  };
}
export function selectProducts(query = {}, products = catalog) {
  const result = products.filter(
    (p) =>
      (!query.q || fold(p.name).includes(fold(query.q))) &&
      (!query.category || query.category === 'all' || p.category === query.category),
  );
  if (query.sort === 'price-asc') result.sort((a, b) => a.price - b.price);
  else if (query.sort === 'price-desc') result.sort((a, b) => b.price - a.price);
  else if (query.sort === 'name') result.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  else result.sort((a, b) => Number(b.featured) - Number(a.featured));
  // Sold-out items stay visible (tagged "Tạm hết") but always sink to the end.
  return result.sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0));
}
