import { createServerFn } from "@tanstack/react-start";

export type RatesResult = { base: string; rates: Record<string, number>; updated: string; error?: string };
export type WeatherResult = {
  city: string;
  country: string;
  tempC: number;
  windKph: number;
  humidity: number;
  code: number;
  isDay: boolean;
  error?: string;
};
export type Holiday = { date: string; localName: string; name: string };
export type HolidaysResult = { countryCode: string; year: number; holidays: Holiday[]; error?: string };
export type TranslateResult = { texts: string[]; error?: string };
export type ChatResult = { reply: string; error?: string };

/** Live FX rates from the open exchangerate-api mirror (no key, real market data). */
export const getExchangeRates = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => (d ?? {}) as { base?: string })
  .handler(async ({ data }): Promise<RatesResult> => {
    const base = (data?.base || "USD").toUpperCase().slice(0, 3);
    try {
      const res = await fetch(`https://open.er-api.com/v6/latest/${base}`);
      if (!res.ok) return { base, rates: {}, updated: "", error: `Rates service error (${res.status}).` };
      const json = (await res.json()) as {
        result?: string;
        rates?: Record<string, number>;
        time_last_update_utc?: string;
      };
      if (json.result !== "success" || !json.rates) {
        return { base, rates: {}, updated: "", error: "Rates unavailable right now." };
      }
      return { base, rates: json.rates, updated: json.time_last_update_utc ?? "" };
    } catch (e) {
      return { base, rates: {}, updated: "", error: e instanceof Error ? e.message : "Network error." };
    }
  });

/** Real current weather from Open-Meteo (no key). Accepts coords or a city name. */
export const getWeather = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => (d ?? {}) as { lat?: number; lon?: number; city?: string })
  .handler(async ({ data }): Promise<WeatherResult> => {
    const empty: WeatherResult = {
      city: "",
      country: "",
      tempC: 0,
      windKph: 0,
      humidity: 0,
      code: 0,
      isDay: true,
    };
    try {
      let lat = data?.lat;
      let lon = data?.lon;
      let city = data?.city ?? "";
      let country = "";

      if (lat == null || lon == null) {
        const q = encodeURIComponent(city || "Mumbai");
        const geo = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${q}&count=1&language=en&format=json`,
        );
        const gj = (await geo.json()) as {
          results?: { latitude: number; longitude: number; name: string; country: string }[];
        };
        const hit = gj.results?.[0];
        if (!hit) return { ...empty, city, error: "City not found." };
        lat = hit.latitude;
        lon = hit.longitude;
        city = hit.name;
        country = hit.country;
      } else {
        const rev = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?latitude=${lat}&longitude=${lon}&count=1&language=en&format=json`,
        ).catch(() => null);
        if (rev?.ok) {
          const rj = (await rev.json()) as { results?: { name: string; country: string }[] };
          city = city || rj.results?.[0]?.name || "Your location";
          country = rj.results?.[0]?.country ?? "";
        } else {
          city = city || "Your location";
        }
      }

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&wind_speed_unit=kmh`,
      );
      if (!res.ok) return { ...empty, city, country, error: `Weather service error (${res.status}).` };
      const wj = (await res.json()) as {
        current?: {
          temperature_2m: number;
          relative_humidity_2m: number;
          is_day: number;
          weather_code: number;
          wind_speed_10m: number;
        };
      };
      const c = wj.current;
      if (!c) return { ...empty, city, country, error: "Weather unavailable." };
      return {
        city,
        country,
        tempC: c.temperature_2m,
        windKph: c.wind_speed_10m,
        humidity: c.relative_humidity_2m,
        code: c.weather_code,
        isDay: c.is_day === 1,
      };
    } catch (e) {
      return { ...empty, error: e instanceof Error ? e.message : "Network error." };
    }
  });

/** Real public holidays from Nager.Date (no key). */
export const getHolidays = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => (d ?? {}) as { countryCode?: string; year?: number })
  .handler(async ({ data }): Promise<HolidaysResult> => {
    const countryCode = (data?.countryCode || "IN").toUpperCase().slice(0, 2);
    const year = data?.year && data.year > 1970 ? Math.floor(data.year) : new Date().getUTCFullYear();
    try {
      const res = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`);
      if (!res.ok) return { countryCode, year, holidays: [], error: `No holiday data (${res.status}).` };
      const json = (await res.json()) as { date: string; localName: string; name: string }[];
      return {
        countryCode,
        year,
        holidays: json.map((h) => ({ date: h.date, localName: h.localName, name: h.name })),
      };
    } catch (e) {
      return { countryCode, year, holidays: [], error: e instanceof Error ? e.message : "Network error." };
    }
  });

/** Real machine translation of UI strings through the Lovable AI gateway. */
export const translateTexts = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { texts: string[]; targetLanguage: string })
  .handler(async ({ data }): Promise<TranslateResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { texts: data.texts, error: "Translation is not configured." };
    if (!data.texts?.length) return { texts: [] };
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You are a UI localisation engine. Translate each input string into the requested language. Keep it short and idiomatic for a software marketplace UI. Reply with ONLY a JSON array of translated strings, same length and order as the input array. No markdown, no commentary.",
            },
            {
              role: "user",
              content: `Target language: ${data.targetLanguage}\nStrings: ${JSON.stringify(data.texts)}`,
            },
          ],
        }),
      });
      if (res.status === 429) return { texts: data.texts, error: "Rate limit reached, try again shortly." };
      if (res.status === 402) return { texts: data.texts, error: "AI credits exhausted." };
      if (!res.ok) return { texts: data.texts, error: `Translation error (${res.status}).` };
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const raw = json.choices?.[0]?.message?.content?.trim() ?? "";
      const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      const parsed = JSON.parse(cleaned) as unknown;
      if (!Array.isArray(parsed) || parsed.length !== data.texts.length) {
        return { texts: data.texts, error: "Unexpected translation response." };
      }
      return { texts: parsed.map((t) => String(t)) };
    } catch (e) {
      return { texts: data.texts, error: e instanceof Error ? e.message : "Translation failed." };
    }
  });

/** Storefront-facing AI assistant (separate persona from the Boss Panel assistant). */
export const askStorefrontAi = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => d as { messages: { role: "user" | "assistant"; content: string }[] })
  .handler(async ({ data }): Promise<ChatResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { reply: "", error: "AI assistant is not configured yet." };
    try {
      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Lovable-API-Key": key },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            {
              role: "system",
              content:
                "You are Vala Assistant for the Software Vala software marketplace. Help visitors find the right product across the master categories, explain what a purchase includes (full source code, 1 year free support, lifetime access, 2-hour delivery), and guide them to live demos, pricing and the Apply Now partner programs. Be concise (max 8 lines). Never invent prices, ratings, download counts or product names you were not given — if unsure, say so and suggest contacting the team.",
            },
            ...data.messages.slice(-16),
          ],
        }),
      });
      if (res.status === 429) return { reply: "", error: "Too many requests — try again in a moment." };
      if (res.status === 402) return { reply: "", error: "AI credits exhausted." };
      if (!res.ok) return { reply: "", error: `AI error (${res.status}).` };
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return { reply: json.choices?.[0]?.message?.content?.trim() || "(no response)" };
    } catch (e) {
      return { reply: "", error: e instanceof Error ? e.message : "Network error." };
    }
  });
