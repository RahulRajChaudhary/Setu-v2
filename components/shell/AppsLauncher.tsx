"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { Pencil, Star } from "lucide-react";
import { LAUNCHER_APPS, type LauncherApp } from "@/lib/mock-data/apps-launcher";
import { useLauncherState } from "@/lib/use-launcher-state";

type SortMode = "alpha" | "recent";
type Zone = "favorites" | "all";
type DropTarget = { zone: Zone; index: number };

function sortApps(apps: LauncherApp[], mode: SortMode, lastUsed: Record<string, number>): LauncherApp[] {
  const copy = [...apps];
  if (mode === "alpha") {
    copy.sort((a, b) => a.name.localeCompare(b.name));
  } else {
    copy.sort((a, b) => (lastUsed[b.id] ?? 0) - (lastUsed[a.id] ?? 0));
  }
  return copy;
}

function AppIcon({ app, size, bg = "var(--surface)" }: { app: LauncherApp; size: number; bg?: string }) {
  const [errored, setErrored] = useState(false);

  if (app.logoUrl && !errored) {
    return (
      <span
        className="pointer-events-none block shrink-0"
        style={{ width: size, height: size, backgroundColor: bg }}
      >
        <img
          src={app.logoUrl}
          alt={app.name}
          width={size}
          height={size}
          style={{ width: size, height: size, mixBlendMode: "multiply" }}
          className="block object-cover"
          draggable={false}
          onError={() => setErrored(true)}
        />
      </span>
    );
  }

  if (app.icon) {
    const Icon = app.icon;
    return (
      <span
        className="pointer-events-none flex shrink-0 items-center justify-center"
        style={{ width: size, height: size }}
      >
        <Icon size={Math.round(size * 0.62)} color={app.fg ?? "var(--icon-btn-navy)"} />
      </span>
    );
  }

  return (
    <span
      className="pointer-events-none flex shrink-0 items-center justify-center text-sm font-semibold text-[var(--text-secondary)]"
      style={{ width: size, height: size }}
    >
      {app.name.charAt(0).toUpperCase()}
    </span>
  );
}

export default function AppsLauncher({ onClose }: { onClose: () => void }) {
  const { favorites, lastUsed, toggleFavorite, setFavoritesOrder, recordUsed } = useLauncherState();
  const [sortMode, setSortMode] = useState<SortMode>("alpha");
  const [editMode, setEditMode] = useState(false);

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<DropTarget | null>(null);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const dragMoved = useRef(false);
  const dragOrigin = useRef<{ x: number; y: number } | null>(null);
  const tileRefs = useRef(new Map<string, HTMLElement>());
  const favoritesGridRef = useRef<HTMLDivElement>(null);
  const allGridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const dragEnabled = editMode;

  const favoriteApps = useMemo(
    () =>
      favorites
        .map((id) => LAUNCHER_APPS.find((app) => app.id === id))
        .filter((app): app is LauncherApp => Boolean(app)),
    [favorites]
  );

  const otherApps = useMemo(
    () => sortApps(LAUNCHER_APPS.filter((app) => !favorites.includes(app.id)), sortMode, lastUsed),
    [favorites, sortMode, lastUsed]
  );

  function openApp(app: LauncherApp) {
    if (!app.liveUrl) return;
    recordUsed(app.id);
    window.open(app.liveUrl, "_blank", "noopener,noreferrer");
    onClose();
  }

  const registerTile = useCallback((id: string, el: HTMLElement | null) => {
    if (el) tileRefs.current.set(id, el);
    else tileRefs.current.delete(id);
  }, []);

  const findInZone = useCallback(
    (x: number, y: number, zone: Zone, list: LauncherApp[], container: HTMLElement | null): DropTarget | null => {
      if (!container) return null;
      const rect = container.getBoundingClientRect();
      if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) return null;
      for (let i = 0; i < list.length; i++) {
        const el = tileRefs.current.get(list[i].id);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
          return { zone, index: x < r.left + r.width / 2 ? i : i + 1 };
        }
      }
      return { zone, index: list.length };
    },
    []
  );

  const findDropTarget = useCallback(
    (x: number, y: number): DropTarget | null =>
      findInZone(x, y, "favorites", favoriteApps, favoritesGridRef.current) ??
      findInZone(x, y, "all", otherApps, allGridRef.current),
    [findInZone, favoriteApps, otherApps]
  );

  function commitDrop(id: string, target: DropTarget) {
    if (target.zone === "all") {
      if (favorites.includes(id)) setFavoritesOrder(favorites.filter((f) => f !== id));
      return;
    }
    const withoutId = favorites.filter((f) => f !== id);
    const index = Math.min(target.index, withoutId.length);
    setFavoritesOrder([...withoutId.slice(0, index), id, ...withoutId.slice(index)]);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLElement>, app: LauncherApp) {
    if (!dragEnabled) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragOrigin.current = { x: e.clientX, y: e.clientY };
    dragMoved.current = false;
    setDragId(app.id);
    setPointer({ x: e.clientX, y: e.clientY });
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLElement>) {
    if (!dragId) return;
    if (dragOrigin.current) {
      const dx = e.clientX - dragOrigin.current.x;
      const dy = e.clientY - dragOrigin.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) dragMoved.current = true;
    }
    setPointer({ x: e.clientX, y: e.clientY });
    if (dragMoved.current) setDragOver(findDropTarget(e.clientX, e.clientY));
  }

  function handlePointerUp() {
    if (dragId && dragMoved.current && dragOver) commitDrop(dragId, dragOver);
    setDragId(null);
    setDragOver(null);
    setPointer(null);
    dragOrigin.current = null;
  }

  function handleTileClick(app: LauncherApp) {
    if (dragMoved.current) {
      dragMoved.current = false;
      return;
    }
    if (editMode) {
      toggleFavorite(app.id);
      return;
    }
    openApp(app);
  }

  const draggedApp = dragId ? LAUNCHER_APPS.find((app) => app.id === dragId) ?? null : null;

  function jiggleStyle(index: number): React.CSSProperties | undefined {
    return dragEnabled ? ({ "--jiggle-delay": `${(index % 3) * 0.06}s` } as React.CSSProperties) : undefined;
  }

  return (
    <div
      className="
        absolute right-0 top-[calc(100%+var(--page-pad-y))] z-50
        flex max-h-[42rem] w-[28rem] max-w-[calc(100vw-1.5rem)]
        flex-col overflow-hidden rounded-xl border border-[var(--divider)]
        bg-[var(--surface)] shadow-xl
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

      <div
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-3 pt-3"
        onPointerMove={dragId ? handlePointerMove : undefined}
        onPointerUp={dragId ? handlePointerUp : undefined}
        onPointerCancel={dragId ? handlePointerUp : undefined}
      >
        {favoriteApps.length > 0 && (
              <div className="mb-2 rounded-2xl bg-[var(--search-bg)] p-3">
                <p className="px-1 pb-2 pt-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                  Your favorites
                </p>
                <div
                  ref={favoritesGridRef}
                  data-zone="favorites"
                  className={`grid grid-cols-3 gap-1 rounded-lg pb-1 transition-colors ${
                    dragOver?.zone === "favorites" ? "bg-[var(--search-bg)] ring-2 ring-[var(--icon-btn-navy)]/30" : ""
                  }`}
                >
                  {favoriteApps.map((app, index) => (
                    <button
                      key={app.id}
                      ref={(el) => registerTile(app.id, el)}
                      type="button"
                      onClick={() => handleTileClick(app)}
                      onPointerDown={(e) => handlePointerDown(e, app)}
                      style={{ touchAction: dragEnabled ? "none" : undefined, ...jiggleStyle(index) }}
                      className={`tap-pop flex flex-col items-center gap-2 rounded-lg px-2 py-3 text-center transition-colors hover:bg-[var(--search-bg)] ${
                        dragEnabled && dragId !== app.id ? "launcher-jiggle" : ""
                      } ${dragId === app.id ? "opacity-30" : ""}`}
                    >
                      <span className="relative">
                        <AppIcon app={app} size={58} bg="var(--search-bg)" />
                        {editMode && (
                          <span className="pointer-events-none absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[var(--status-critical-fg)] text-[0.5rem] text-white">
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
              </div>
            )}

            <div className="flex items-center justify-between px-1 pb-1 pt-2">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                All products
              </p>
              {editMode ? (
                <p className="text-[0.625rem] text-[var(--text-muted)]">Drag to arrange</p>
              ) : (
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
              )}
            </div>

            <div
              ref={allGridRef}
              data-zone="all"
              className={`grid grid-cols-3 gap-1 rounded-lg pb-2 transition-colors ${
                dragOver?.zone === "all" ? "bg-[var(--search-bg)] ring-2 ring-[var(--icon-btn-navy)]/30" : ""
              }`}
            >
              {otherApps.map((app, index) => (
                <div
                  key={app.id}
                  ref={(el) => registerTile(app.id, el)}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleTileClick(app)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") handleTileClick(app);
                  }}
                  onPointerDown={(e) => handlePointerDown(e, app)}
                  style={{ touchAction: dragEnabled ? "none" : undefined, ...jiggleStyle(index) }}
                  className={`group relative flex cursor-pointer flex-col items-center gap-2 rounded-lg px-2 py-3 text-center transition-colors hover:bg-[var(--search-bg)] ${
                    dragEnabled && dragId !== app.id ? "launcher-jiggle" : ""
                  } ${dragId === app.id ? "opacity-30" : ""}`}
                >
                  <button
                    type="button"
                    title={favorites.includes(app.id) ? "Remove from favorites" : "Add to favorites"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(app.id);
                    }}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full text-[var(--text-muted)] opacity-0 transition-opacity hover:text-[var(--icon-btn-navy)] group-hover:opacity-100"
                  >
                    <Star
                      size={12}
                      fill={favorites.includes(app.id) ? "currentColor" : "none"}
                      className={favorites.includes(app.id) ? "text-[var(--icon-btn-navy)] opacity-100" : ""}
                    />
                  </button>
                  <AppIcon app={app} size={46} />
                  <span className="text-[0.6875rem] font-medium leading-tight text-[var(--text-secondary)]">
                    {app.name}
                  </span>
                </div>
              ))}
            </div>
      </div>

      {draggedApp && pointer && (
        <div
          className="pointer-events-none fixed z-[60] flex flex-col items-center gap-1 opacity-90"
          style={{ left: pointer.x - 22, top: pointer.y - 22 }}
        >
          <AppIcon app={draggedApp} size={44} />
        </div>
      )}
    </div>
  );
}
