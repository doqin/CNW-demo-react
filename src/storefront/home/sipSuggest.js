import { catalog } from '../data/catalog.js';

/*
 * "Hôm nay uống gì?" — a transparent scoring model, no AI service. Every product has a few
 * traits; the moment (weather + hour) turns traits into points, and each point carries the
 * human reason shown on the card. Out-of-stock products are never suggested.
 */
export const traits = {
  P02: { cold: 3, fruity: 3, caffeine: 1 }, // Trà đào
  P03: { cold: 2, hydrate: 3, caffeine: 0 }, // Nước suối
  P04: { warm: 2, caffeine: 3, classic: 2 }, // Cà phê sữa
  P05: { cold: 2, caffeine: 3, smooth: 2 }, // Cold brew
  P06: { warm: 1, cold: 1, caffeine: 2, smooth: 2 }, // Matcha latte
  P07: { cold: 3, fruity: 3, caffeine: 1 }, // Trà vải
  P08: { cold: 3, fruity: 2, hydrate: 1, caffeine: 1 }, // Trà chanh
  P09: { warm: 3, cozy: 3, caffeine: 0 }, // Cacao sữa
};
/** One accessory to go with the drinks, depending on the moment. */
const companions = { heat: 'P01', rain: 'P10', default: 'P11' };

/** WMO weather codes used by Open-Meteo. */
export function describeWeather(code) {
  if (code === 0) return 'Trời quang';
  if (code <= 2) return 'Ít mây';
  if (code === 3) return 'Nhiều mây';
  if (code === 45 || code === 48) return 'Sương mù';
  if (code >= 51 && code <= 57) return 'Mưa phùn';
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return 'Có mưa';
  if (code >= 95) return 'Mưa giông';
  return 'Thời tiết thay đổi';
}
const isRainCode = (code) => (code >= 51 && code <= 67) || (code >= 80 && code <= 82) || code >= 95;

export function dayPart(hour) {
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 14) return 'noon';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 21) return 'evening';
  return 'night';
}

/** Classifies the moment. `weather` may be null (offline): then only the hour is used. */
export function readMoment({ hour, weather }) {
  const part = dayPart(hour);
  const feels = weather?.apparentTemperature ?? weather?.temperature;
  const rain = !!weather && (isRainCode(weather.code) || weather.precipitation >= 0.3);
  const heat = !!weather && !rain && feels >= 32;
  const cool = !!weather && feels <= 24;
  return { part, rain, heat, cool, feels, hasWeather: !!weather };
}

const headlines = {
  rain: ['Trời đang mưa,', 'một ngụm ấm cho đỡ lạnh.'],
  heat: ['Ngoài trời nắng gắt,', 'cần gì đó thật mát.'],
  cool: ['Trời se lạnh,', 'giữ tay ấm một chút.'],
  morning: ['Chào buổi sáng,', 'bắt đầu ngày thật tỉnh táo.'],
  noon: ['Giữa trưa rồi,', 'nghỉ một chút cho mát.'],
  afternoon: ['Ba giờ chiều buồn ngủ?', 'Một ngụm để tỉnh lại.'],
  evening: ['Chiều tối thong thả,', 'nhẹ nhàng thôi.'],
  night: ['Khuya rồi,', 'chọn món ít caffeine nhé.'],
};

/**
 * Returns `{ key, headline, picks: [{ product, score, reason }], companion }`.
 * Pure: pass `products` and the moment, get the same answer every time.
 */
export function suggestSips({ hour, weather }, products = catalog) {
  const moment = readMoment({ hour, weather });
  const { part, rain, heat, cool } = moment;
  const scored = products
    .filter((p) => p.stock > 0 && traits[p.id])
    .map((product) => {
      const t = traits[product.id];
      const reasons = [];
      let score = 0;
      const add = (points, reason) => {
        if (points <= 0) return;
        score += points;
        if (reason) reasons.push([points, reason]);
      };
      if (heat) {
        add((t.cold || 0) * 3, `Mát lạnh, dễ chịu khi trời ${Math.round(moment.feels)}°C`);
        add((t.hydrate || 0) * 2, 'Bù nước khi nắng nóng');
        score -= (t.warm || 0) * 3;
      }
      if (rain || cool) {
        add((t.warm || 0) * 3, rain ? 'Ấm áp cho ngày mưa' : 'Ấm tay khi trời se lạnh');
        add((t.cozy || 0) * 2, 'Dịu ngọt, dễ chịu');
        score -= (t.cold || 0) * 1;
      }
      if (part === 'morning') add((t.caffeine || 0) * 2, 'Đủ caffeine cho buổi sáng tỉnh táo');
      if (part === 'afternoon') {
        add((t.caffeine || 0) * 1.5, 'Chống cơn buồn ngủ đầu giờ chiều');
        add(t.smooth || 0, 'Êm vị, uống chậm cũng ngon');
      }
      if (part === 'noon') add((t.fruity || 0) * 1.5, 'Vị trái cây nhẹ nhàng sau bữa trưa');
      if (part === 'evening' || part === 'night') {
        score -= (t.caffeine || 0) * 3;
        add(t.caffeine === 0 ? 4 : 0, 'Không caffeine, không lo mất ngủ');
        add((t.fruity || 0) * 1, 'Thanh nhẹ cho buổi tối');
      }
      add(t.classic || 0, 'Vị quen thuộc ai cũng thích');
      reasons.sort((a, b) => b[0] - a[0]);
      return {
        product,
        score: Math.round(score * 10) / 10,
        reason: reasons[0]?.[1] || product.detail,
      };
    })
    .sort((a, b) => b.score - a.score || a.product.price - b.product.price);

  const key = rain ? 'rain' : heat ? 'heat' : cool ? 'cool' : part;
  const companionId = rain ? companions.rain : heat ? companions.heat : companions.default;
  const companion = products.find((p) => p.id === companionId && p.stock > 0) || null;
  return { key, moment, headline: headlines[key], picks: scored.slice(0, 3), companion };
}

/* ---------- Open-Meteo (free, no API key) ---------- */

export const DEFAULT_PLACE = { name: 'TP. Hồ Chí Minh', latitude: 10.87, longitude: 106.8 };

export async function fetchWeather({ latitude, longitude }, { signal, fetchImpl = fetch } = {}) {
  const url =
    'https://api.open-meteo.com/v1/forecast' +
    `?latitude=${latitude.toFixed(2)}&longitude=${longitude.toFixed(2)}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code' +
    '&timezone=auto';
  const response = await fetchImpl(url, { signal });
  if (!response.ok) throw Error(`Open-Meteo ${response.status}`);
  const { current } = await response.json();
  const weather = {
    temperature: current?.temperature_2m,
    apparentTemperature: current?.apparent_temperature,
    humidity: current?.relative_humidity_2m,
    precipitation: current?.precipitation ?? 0,
    code: current?.weather_code,
  };
  if (!Number.isFinite(weather.temperature) || !Number.isInteger(weather.code))
    throw Error('Open-Meteo trả về dữ liệu không đầy đủ');
  return weather;
}
