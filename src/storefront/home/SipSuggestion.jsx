import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router';
import { useStore } from '../StorefrontProviders.jsx';
import { formatPrice } from '../data/catalog.js';
import { getStorage } from '../cart/cartStorage.js';
import { ImageWithFallback } from '../ui/ImageWithFallback.jsx';
import { StoreIcon } from '../ui/Icons.jsx';
import { DEFAULT_PLACE, describeWeather, fetchWeather, suggestSips } from './sipSuggest.js';
import { SipWheel } from './SipWheel.jsx';

const CACHE_KEY = 'se347.weather.v1';
const CACHE_MS = 30 * 60 * 1000;
const companionNote = {
  P01: 'mang theo nước cả ngày nắng',
  P10: 'giữ đồ uống ấm lâu hơn',
  P11: 'nhỏ thôi, dùng lại thật lâu',
};

function readCache(place) {
  try {
    const value = JSON.parse(getStorage('sessionStorage')?.getItem(CACHE_KEY) || 'null');
    const fresh = value && Date.now() - value.at < CACHE_MS;
    return fresh && value.place?.name === place.name ? value.weather : null;
  } catch {
    return null;
  }
}
function writeCache(place, weather) {
  try {
    getStorage('sessionStorage')?.setItem(
      CACHE_KEY,
      JSON.stringify({ place, weather, at: Date.now() }),
    );
  } catch {
    /* Cache is optional. */
  }
}

export function SipSuggestion() {
  const { addItem, pending } = useStore();
  const { onItemAdded } = useOutletContext();
  const [now] = useState(() => new Date());
  const [place, setPlace] = useState(DEFAULT_PLACE);
  const [weather, setWeather] = useState(() => readCache(DEFAULT_PLACE));
  const [status, setStatus] = useState(() => (readCache(DEFAULT_PLACE) ? 'ready' : 'loading'));

  useEffect(() => {
    if (readCache(place)) return;
    let active = true;
    const controller = new AbortController();
    // A slow network must not keep the card waiting: after 6 s, fall back to the hour.
    const timer = setTimeout(() => controller.abort(), 6000);
    fetchWeather(place, { signal: controller.signal })
      .then((value) => {
        writeCache(place, value);
        if (!active) return;
        setWeather(value);
        setStatus('ready');
      })
      .catch(() => {
        if (active) setStatus('offline');
      })
      .finally(() => clearTimeout(timer));
    return () => {
      active = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [place]);

  function locateMe() {
    if (!navigator.geolocation) {
      setStatus('no-location');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const next = {
          name: 'Vị trí của bạn',
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        const cached = readCache(next);
        setPlace(next);
        setWeather(cached);
        setStatus(cached ? 'ready' : 'loading');
      },
      () => setStatus(weather ? 'ready' : 'no-location'),
      { timeout: 8000, maximumAge: 10 * 60 * 1000 },
    );
  }

  const shownWeather = status === 'offline' ? null : weather;
  const { headline, picks, companion, moment } = suggestSips({
    hour: now.getHours(),
    weather: shownWeather,
  });
  const time = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const statusText = {
    loading: 'Đang xem thời tiết…',
    locating: 'Đang lấy vị trí của bạn…',
    offline: 'Chưa lấy được thời tiết, đang gợi ý theo giờ trong ngày.',
    'no-location': 'Không dùng được vị trí, vẫn gợi ý theo TP. Hồ Chí Minh.',
    ready: '',
  }[status];

  return (
    <section className="sip-suggest wrap" aria-labelledby="sip-title" data-moment={moment.part}>
      <div className="sip-context">
        <p className="eyebrow">
          <span className="little-spark">✳</span> HÔM NAY UỐNG GÌ?
        </p>
        <h2 id="sip-title">
          {headline[0]} <em>{headline[1]}</em>
        </h2>
        <p className="sip-weather" data-testid="sip-weather">
          {shownWeather ? (
            <>
              <strong>{Math.round(shownWeather.temperature)}°C</strong>
              <span>cảm giác {Math.round(shownWeather.apparentTemperature)}°C</span>
              <span>{describeWeather(shownWeather.code)}</span>
              {Number.isFinite(shownWeather.humidity) && <span>độ ẩm {shownWeather.humidity}%</span>}
            </>
          ) : (
            <strong>Gợi ý theo giờ</strong>
          )}
          <span>
            {place.name} · {time}
          </span>
        </p>
        <p className="sip-status" role="status">
          {statusText}
        </p>
        <button
          className="text-link sip-locate"
          type="button"
          onClick={locateMe}
          disabled={status === 'locating'}
        >
          Dùng vị trí của tôi <StoreIcon name="arrow" size={15} />
        </button>
        <p className="sip-source">
          Thời tiết từ Open-Meteo. Không có mạng, OneSip vẫn gợi ý theo giờ trong ngày.
        </p>
        <SipWheel />
      </div>
      <ol className="sip-picks">
        {picks.map(({ product, reason }, index) => (
          <li key={product.id}>
            <span className="sip-rank">{index + 1}</span>
            <Link className="sip-image" to={`/products/${product.slug}`} tabIndex={-1}>
              <ImageWithFallback src={product.thumbnail} alt="" />
            </Link>
            <div className="sip-copy">
              <Link to={`/products/${product.slug}`}>
                <strong>{product.name}</strong>
              </Link>
              <p>{reason}</p>
              <span>{formatPrice(product.price)}</span>
            </div>
            <button
              className="quick-add"
              disabled={pending}
              aria-label={`Thêm ${product.name} vào giỏ`}
              onClick={(event) => {
                addItem(product.id, 1);
                onItemAdded(product.id, event.detail === 0);
              }}
            >
              <StoreIcon name="plus" size={18} />
            </button>
          </li>
        ))}
        {companion && (
          <li className="sip-companion">
            <span>Đi kèm:</span>
            <Link to={`/products/${companion.slug}`}>{companion.name}</Link>
            <span>— {companionNote[companion.id]}</span>
          </li>
        )}
      </ol>
    </section>
  );
}
