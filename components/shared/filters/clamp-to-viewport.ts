// Keeps a portal-rendered popup fully inside the viewport, flipping above
// the trigger when there isn't room below, and never letting it push the
// document wider/taller than the viewport (which would add page scrollbars).
export function clampToViewport(
  trigger: DOMRect,
  popupWidth: number,
  popupHeight: number,
  align: "left" | "right",
  margin = 8,
) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const desiredLeft = align === "right" ? trigger.right - popupWidth : trigger.left;
  const maxLeft = Math.max(margin, viewportWidth - popupWidth - margin);
  const left = Math.min(Math.max(desiredLeft, margin), maxLeft);

  const spaceBelow = viewportHeight - trigger.bottom;
  const fitsBelow = spaceBelow >= popupHeight + margin || trigger.top < popupHeight + margin;
  const desiredTop = fitsBelow ? trigger.bottom + margin : trigger.top - popupHeight - margin;
  const maxTop = Math.max(margin, viewportHeight - popupHeight - margin);
  const top = Math.min(Math.max(desiredTop, margin), maxTop);

  return {
    top: top + window.scrollY,
    left: left + window.scrollX,
  };
}
