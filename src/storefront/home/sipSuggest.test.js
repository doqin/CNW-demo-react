import { describe, expect, it, vi } from 'vitest';
import { catalog } from '../data/catalog.js';
import { dayPart, describeWeather, fetchWeather, suggestSips } from './sipSuggest.js';

const names = (result) => result.picks.map((p) => p.product.name);
const weather = (over) => ({
  temperature: 30,
  apparentTemperature: 30,
  humidity: 70,
  precipitation: 0,
  code: 1,
  ...over,
});

describe('sip suggestions', () => {
  it('suggests cold, fruity drinks and a water bottle on a hot afternoon', () => {
    const result = suggestSips({ hour: 13, weather: weather({ temperature: 34, apparentTemperature: 39 }) });
    expect(result.key).toBe('heat');
    expect(names(result)).toEqual(['Trà chanh', 'Trà đào', 'Trà vải']);
    expect(result.picks[0].reason).toContain('39°C');
    expect(result.companion.name).toBe('Bình nước');
  });

  it('suggests warm drinks and a thermal cup when it rains', () => {
    const result = suggestSips({ hour: 9, weather: weather({ code: 63, precipitation: 2.1 }) });
    expect(result.key).toBe('rain');
    expect(names(result).slice(0, 2)).toEqual(['Cà phê sữa', 'Matcha latte']);
    expect(result.companion.name).toBe('Ly giữ nhiệt');
  });

  it('never suggests a product that is out of stock', () => {
    // Cacao sữa is the coziest drink for a rainy night, but it has no stock.
    const result = suggestSips({ hour: 22, weather: weather({ code: 80, apparentTemperature: 23 }) });
    expect(names(result)).not.toContain('Cacao sữa');
    const restocked = catalog.map((p) => (p.id === 'P09' ? { ...p, stock: 5 } : p));
    expect(names(suggestSips({ hour: 22, weather: weather({ code: 80 }) }, restocked))[0]).toBe(
      'Cacao sữa',
    );
  });

  it('keeps coffee away at night and brings it in the morning, even offline', () => {
    const night = suggestSips({ hour: 23, weather: null });
    expect(night.key).toBe('night');
    expect(names(night)[0]).toBe('Nước suối');
    expect(names(night)).not.toContain('Cà phê sữa');
    const morning = suggestSips({ hour: 7, weather: null });
    expect(names(morning).slice(0, 2)).toEqual(['Cà phê sữa', 'Cold brew']);
  });

  it('describes day parts and WMO weather codes in Vietnamese', () => {
    expect([6, 12, 15, 19, 2].map(dayPart)).toEqual([
      'morning',
      'noon',
      'afternoon',
      'evening',
      'night',
    ]);
    expect(describeWeather(0)).toBe('Trời quang');
    expect(describeWeather(95)).toBe('Mưa giông');
  });
});

describe('Open-Meteo client', () => {
  it('reads the current weather', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 33.4,
          apparent_temperature: 38.1,
          relative_humidity_2m: 61,
          precipitation: 0,
          weather_code: 2,
        },
      }),
    });
    const result = await fetchWeather({ latitude: 10.87, longitude: 106.8 }, { fetchImpl });
    expect(fetchImpl.mock.calls[0][0]).toContain('latitude=10.87&longitude=106.80');
    expect(result).toEqual({
      temperature: 33.4,
      apparentTemperature: 38.1,
      humidity: 61,
      precipitation: 0,
      code: 2,
    });
  });

  it('fails on an error status or incomplete data, so the card falls back to the hour', async () => {
    const bad = (body, ok = true) => vi.fn().mockResolvedValue({ ok, status: 500, json: async () => body });
    await expect(fetchWeather({ latitude: 1, longitude: 1 }, { fetchImpl: bad({}, false) })).rejects.toThrow();
    await expect(fetchWeather({ latitude: 1, longitude: 1 }, { fetchImpl: bad({ current: {} }) })).rejects.toThrow();
  });
});
