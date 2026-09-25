"use client";

import { useMemo, useState } from "react";
import { Pencil, Star } from "lucide-react";
import { LAUNCHER_APPS, type LauncherApp } from "@/lib/mock-data/apps-launcher";
import { useLauncherState } from "@/lib/use-launcher-state";

type SortMode = "alpha" | "recent";

function sortApps(apps: LauncherApp[], mode: SortMode, lastUsed: Record<string, number>): LauncherApp[] {
  const copy = [...apps];
  if (mode === "alpha") {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    copy.sort((a, b) => (lastUsed[b.id] ?? 0) - (lastUsed[a.id] ?? 0));
  }
  return copy;
}

function AppIcon({ app, size }: { app: LauncherApp; size: number }) {
  const [errored, setErrored] = useState(false);

  if (app.logoUrl && !errored) {
    return (
      <img
        src={app.logoUrl}
        alt={app.name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className="shrink-0 rounded-full object-cover"
        onError={() => setErrored(true)}
      />
    );
  }

  if (app.icon) {
    const Icon = app.icon;
    return (
      <span
        className="flex shrink-0 items-center justify-center rounded-full"
        style={{ width: size, height: size, backgroundColor: app.bg ?? "#E2E8F0" }}
      >
        <Icon size={Math.round(size * 0.5)} color={app.fg ?? "#0B1B3B"} />
      </span>
    );
  }

  return (
    <span
      className="flex shrink-0 items-center justify-center rounded-full bg-[var(--search-bg)] text-sm font-semibold text-[var(--text-secondary)]"
      style={{ width: size, height: size }}
    >
      {app.name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function AppsLauncher({ onClose }: { onClose: () => void }) {
  const { favorites, lastUsed, toggleFavorite, recordUsed } = useLauncherState();
  const [sortMode, setSortMode] = useState<SortMode>("alpha");
  const [editMode, setEditMode] = useState(false);

  const favoriteApps = useMemo(
    () => sortApps(LAUNCHER_APPS.filter((app) => favorites.includes(app.id)), sortMode, lastUsed),
    [favorites, sortMode, lastUsed]
  );

  const allApps = useMemo(() => sortApps(LAUNCHER_APPS, sortMode, lastUsed), [sortMode, lastUsed]);

  function openApp(app: LauncherApp) {
    if (!app.liveUrl) return;
    recordUsed(app.id);
    window.open(app.liveUrl, "_blank", "noopener,noreferrer");
    onClose();
  }

  return (
    <div
      className="
        absolute right-0 top-[calc(100%+0.5rem)] z-50
        flex max-h-[32rem] w-[21rem] max-w-[calc(100vw-1.5rem)]
        flex-col overflow-hidden rounded-xl border border-[var(--divider)]
        bg-white shadow-xl
      "
    >
      <div className="flex shrink-0 items-center justify-between px-4 pt-4">
        <p className="text-sm font-semibold text-[var(--text-heading)]">Sahayogi Apps</p>
        <button
          type="button"
          title={editMode ? "Done editing" : "Edit favorites"}
          onClick={() => setEditMode((v) => !v)}
          className={`tap-pop flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
            editMode
              ? "bg-[var(--icon-btn-navy)] text-white"
              : "text-[var(--text-muted)] hover:bg-[var(--search-bg)]"
          }`}
        >
          <Pencil size={14} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-2">
        {favoriteApps.length > 0 && (
          <>
            <p className="px-1 pb-1 pt-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
              Your favorites
            </p>
            <div className="grid grid-cols-3 gap-1 pb-2">
              {favoriteApps.map((app) => (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => (editMode ? toggleFavorite(app.id) : openApp(app))}
                  className="tap-pop flex flex-col items-center gap-2 rounded-lg px-2 py-3 text-center transition-colors hover:bg-[var(--search-bg)]"
                >
                  <span className="relative">
                    <AppIcon app={app} size={44} />
                    {editMode && (
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--status-critical-fg)] text-[0.5rem] text-white">
                        &minus;
                      </span>
                    )}
                  </span>
                  <span className="text-[0.6875rem] font-medium leading-tight text-[var(--text-secondary)]">
                    {app.name}
                  </span>
                </button>
              ))}
            </div>
            <div className="my-1 border-t border-[var(--divider)]" />
          </>
        )}

        <div className="flex items-center justify-between px-1 pb-1 pt-2">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            All apps
          </p>
          <div className="flex overflow-hidden rounded-full border border-[var(--divider)] text-[0.625rem]">
            <button
              type="button"
              onClick={() => setSortMode("alpha")}
              className={`px-2 py-0.5 font-medium transition-colors ${
                sortMode === "alpha"
                  ? "bg-[var(--icon-btn-navy)] text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--search-bg)]"
              }`}
            >
              A&ndash;Z
            </button>
            <button
              type="button"
              onClick={() => setSortMode("recent")}
              className={`px-2 py-0.5 font-medium transition-colors ${
                sortMode === "recent"
                  ? "bg-[var(--icon-btn-navy)] text-white"
                  : "text-[var(--text-muted)] hover:bg-[var(--search-bg)]"
              }`}
            >
              Recent
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          {allApps.map((app) => {
            const isFavorite = favorites.includes(app.id);
            return (
              <div
                key={app.id}
                className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--search-bg)]"
              >
                <button
                  type="button"
                  onClick={() => openApp(app)}
                  disabled={!app.liveUrl}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left disabled:cursor-default"
                >
                  <AppIcon app={app} size={28} />
                  <span className="truncate text-xs font-medium text-[var(--text-secondary)]">{app.name}</span>
                </button>
                <button
                  type="button"
                  title={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  onClick={() => toggleFavorite(app.id)}
                  className="shrink-0 text-[var(--text-muted)] transition-colors hover:text-[var(--icon-btn-navy)]"
                >
                  <Star
                    size={14}
                    fill={isFavorite ? "currentColor" : "none"}
                    className={isFavorite ? "text-[var(--icon-btn-navy)]" : ""}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
