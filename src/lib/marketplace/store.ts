import { useEffect, useState, useSyncExternalStore } from "react";
import { findCurrency, formatFromUsd, type Currency } from "./currencies";
import { findLanguage, type Language } from "./languages";

type Listener = () => void;

function createStore<T>(key: string, initial: T) {
  let value: T = initial;
  let loaded = false;
  const listeners = new Set<Listener>();
  const get = (): T => {
    if (!loaded && typeof window !== "undefined") {
      loaded = true;
      try { const raw = window.localStorage.getItem(key); if (raw) value = JSON.parse(raw) as T; } catch {}
    }
    return value;
  };
  const set = (next: T) => {
    value = next; loaded = true;
    try { window.localStorage.setItem(key, JSON.stringify(next)); } catch {}
    listeners.forEach((l) => l());
  };
  const subscribe = (l: Listener) => { listeners.add(l); return () => { listeners.delete(l); }; };
  return { get, set, subscribe, getServer: () => initial };
}

export interface CartItem { id: string; qty: number; }
export interface RecentEntry { id: string; ts: number; }
export interface ActionEntry { label: string; ts: number; }

export const favoritesStore = createStore<string[]>("sv:favorites:v1", []);
export const cartStore = createStore<CartItem[]>("sv:cart:v1", []);
export const recentStore = createStore<RecentEntry[]>("sv:recent:v1", []);
export const actionStore = createStore<ActionEntry[]>("sv:actions:v1", []);
export const currencyStore = createStore<string>("sv:currency:v1", "USD");
export const languageStore = createStore<string>("sv:language:v1", "en");

export const toggleFavoriteId = (id: string) => {
  const cur = favoritesStore.get();
  favoritesStore.set(cur.includes(id) ? cur.filter((f) => f !== id) : [id, ...cur]);
};
export const addToCartId = (id: string) => {
  const cur = cartStore.get();
  const found = cur.find((i) => i.id === id);
  cartStore.set(found ? cur.map((i) => i.id === id ? { ...i, qty: i.qty + 1 } : i) : [{ id, qty: 1 }, ...cur]);
};
export const setCartQty = (id: string, qty: number) => {
  const cur = cartStore.get();
  cartStore.set(qty <= 0 ? cur.filter((i) => i.id !== id) : cur.map((i) => i.id === id ? { ...i, qty } : i));
};
export const removeFromCartId = (id: string) => cartStore.set(cartStore.get().filter((i) => i.id !== id));
export const clearCartItems = () => cartStore.set([]);
export const pushRecentView = (id: string) => {
  const cur = recentStore.get().filter((r) => r.id !== id);
  recentStore.set([{ id, ts: Date.now() }, ...cur].slice(0, 12));
};
export const clearRecentViews = () => recentStore.set([]);
export const pushRecentAction = (label: string) => {
  actionStore.set([{ label, ts: Date.now() }, ...actionStore.get()].slice(0, 15));
};

export function useHydrated(): boolean {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function useFavorites() {
  const ids = useSyncExternalStore(favoritesStore.subscribe, favoritesStore.get, favoritesStore.getServer);
  return { ids, toggle: toggleFavoriteId, has: (id: string) => ids.includes(id) };
}
export function useCart() {
  const items = useSyncExternalStore(cartStore.subscribe, cartStore.get, cartStore.getServer);
  const count = items.reduce((n, i) => n + i.qty, 0);
  return { items, count, add: addToCartId, setQty: setCartQty, remove: removeFromCartId, clear: clearCartItems };
}
export function useRecentViews() {
  const entries = useSyncExternalStore(recentStore.subscribe, recentStore.get, recentStore.getServer);
  return { entries, push: pushRecentView, clear: clearRecentViews };
}
export function useRecentActions() {
  const entries = useSyncExternalStore(actionStore.subscribe, actionStore.get, actionStore.getServer);
  return { entries, push: pushRecentAction };
}
export function useCurrency() {
  const code = useSyncExternalStore(currencyStore.subscribe, currencyStore.get, currencyStore.getServer);
  const currency: Currency = findCurrency(code);
  return { code: currency.code, currency, set: (c: string) => currencyStore.set(c), format: (u: string | number) => formatFromUsd(u, currency) };
}
export function useLanguage() {
  const code = useSyncExternalStore(languageStore.subscribe, languageStore.get, languageStore.getServer);
  const language: Language = findLanguage(code);
  const set = (next: string) => {
    languageStore.set(next);
    const lang = findLanguage(next);
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang.code;
      document.documentElement.dir = lang.rtl ? "rtl" : "ltr";
    }
  };
  return { code: language.code, language, set };
}
