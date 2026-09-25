"use client";

import { useCallback, useEffect, useState } from "react";
import { LAUNCHER_APPS } from "@/lib/mock-data/apps-launcher";

const FAVORITES_KEY = "setu.launcher.favorites";
const LAST_USED_KEY = "setu.launcher.lastUsed";

function defaultFavorites(): string[] {
  return LAUNCHER_APPS.filter((app) => app.kind === "product").map((app) => app.id);
}

function readFavorites(): string[] {
  const raw = window.localStorage.getItem(FAVORITES_KEY);
  if (!raw) return defaultFavorites();
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultFavorites();
  } catch {
    return defaultFavorites();
  }
}

function readLastUsed(): Record<string, number> {
  const raw = window.localStorage.getItem(LAST_USED_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function useLauncherState() {
  const [favorites, setFavorites] = useState<string[]>(defaultFavorites);
  const [lastUsed, setLastUsed] = useState<Record<string, number>>({});

  useEffect(() => {
    setFavorites(readFavorites());
    setLastUsed(readLastUsed());
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((current) => {
      const next = current.includes(id) ? current.filter((f) => f !== id) : [...current, id];
      window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  /** Reorders/moves favorites in one shot — used by drag-and-drop (reorder within
   * favorites, drop-to-add from "All products", drop-to-remove onto "All products"). */
  const setFavoritesOrder = useCallback((next: string[]) => {
    setFavorites(next);
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
  }, []);

  const recordUsed = useCallback((id: string) => {
    setLastUsed((current) => {
      const next = { ...current, [id]: Date.now() };
      window.localStorage.setItem(LAST_USED_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { favorites, lastUsed, toggleFavorite, setFavoritesOrder, recordUsed };
}
