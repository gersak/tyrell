/**
 * Core positioning engine for floating elements
 *
 * Handles smart positioning of tooltips, dropdowns, popups, and other
 * floating elements relative to anchor elements with automatic overflow
 * detection and placement fallback.
 */

/**
 * Placement orientation - how the floating element is positioned
 */
export type PlacementOrientation = 'horizontal' | 'vertical';

/**
 * Vertical alignment options
 */
export type VerticalAlign = 'top' | 'start' | 'center' | 'bottom' | 'end';

/**
 * Horizontal alignment options
 */
export type HorizontalAlign = 'start' | 'center' | 'end';

/**
 * All available placement options
 */
export type Placement = 
  | 'top-start' | 'top' | 'top-end'
  | 'right-start' | 'right' | 'right-end'
  | 'bottom-start' | 'bottom' | 'bottom-end'
  | 'left-start' | 'left' | 'left-end';

/**
 * Placement configuration
 */
export interface PlacementConfig {
  vertical: VerticalAlign;
  horizontal: HorizontalAlign;
  orientation?: PlacementOrientation;
}

/**
 * Element rectangle with calculated center points
 */
export interface ElementRect {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  centerX: number;
  centerY: number;
}

/**
 * Viewport dimensions and scroll position
 */
export interface ViewportRect {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
}

/**
 * Overflow data for all edges
 */
export interface OverflowData {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

/**
 * Calculated position result
 */
export interface PositionResult {
  x: number;
  y: number;
  placement: Placement;
  overflow: OverflowData;
  overflowAmount: number;
  fits: boolean;
}

/**
 * Options for findBestPosition
 */
export interface PositionOptions {
  targetEl: HTMLElement;
  floatingEl: HTMLElement;
  preferences?: Placement[];
  offset?: number;
  padding?: number;
  containerPadding?: number;
}

/**
 * Options for calculatePlacement
 */
export interface CalculatePlacementOptions {
  targetRect: ElementRect;
  floatingRect: ElementRect;
  placement: Placement;
  offset: number;
  padding: number;
  scrollbarWidth: number;
  containerPadding: number;
}

/**
 * Cleanup function type
 */
export type CleanupFn = () => void;

/**
 * Map of all placement configurations
 */
export const placements: Record<Placement, PlacementConfig> = {
  'top-start': {
    vertical: 'top',
    horizontal: 'start',
  },
  'top': {
    vertical: 'top',
    horizontal: 'center',
  },
  'top-end': {
    vertical: 'top',
    horizontal: 'end',
  },
  'right-start': {
    vertical: 'start',
    horizontal: 'end',
    orientation: 'vertical',
  },
  'right': {
    vertical: 'center',
    horizontal: 'end',
    orientation: 'vertical',
  },
  'right-end': {
    vertical: 'end',
    horizontal: 'end',
    orientation: 'vertical',
  },
  'bottom-start': {
    vertical: 'bottom',
    horizontal: 'start',
  },
  'bottom': {
    vertical: 'bottom',
    horizontal: 'center',
  },
  'bottom-end': {
    vertical: 'bottom',
    horizontal: 'end',
  },
  'left-start': {
    vertical: 'start',
    horizontal: 'start',
    orientation: 'vertical',
  },
  'left': {
    vertical: 'center',
    horizontal: 'start',
    orientation: 'vertical',
  },
  'left-end': {
    vertical: 'end',
    horizontal: 'start',
    orientation: 'vertical',
  },
};

/**
 * Default placement preference lists for different use cases
 */
export const placementPreferences = {
  default: [
    'bottom-start', 'bottom-end', 'top-start', 'top-end',
    'bottom', 'top', 'left', 'right'
  ] as Placement[],
  tooltip: [
    'top', 'bottom', 'left', 'right',
    'top-start', 'top-end', 'bottom-start', 'bottom-end'
  ] as Placement[],
  dropdown: [
    'bottom-start', 'bottom-end', 'top-start', 'top-end',
    'bottom', 'top', 'right', 'left'
  ] as Placement[],
};

/** The four sides a floating element can sit on. */
export type PlacementSide = 'top' | 'right' | 'bottom' | 'left';

/** Cross-axis alignment against the anchor. Omitted means centred. */
export type PlacementAlign = 'start' | 'end';

const OPPOSITE_SIDE: Record<PlacementSide, PlacementSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/** Split `'left-end'` into `{ side: 'left', align: 'end' }`. */
export function parsePlacement(
  placement: Placement
): { side: PlacementSide; align?: PlacementAlign } {
  const [side, align] = placement.split('-') as [PlacementSide, PlacementAlign | undefined];
  return { side, align };
}

/**
 * Fallback order to try for a requested placement, best-fit first.
 *
 * FLIP BEFORE RE-ALIGN. When a placement overflows it is almost always the
 * SIDE axis that ran out of room, and re-aligning on the same side does not
 * change the fit at all: `bottom-start` and `bottom-end` need identical
 * vertical space. Flipping to the opposite side is the move that actually
 * helps, so the requested alignment is carried across the flip first, and only
 * then do we try other alignments.
 *
 * This also keeps the old hand-written chains intact for the four bare sides —
 * `top` still degrades to `bottom` as its very next candidate, exactly as
 * before aligned placements existed.
 *
 * Callers previously hand-wrote a 4-entry chain per side, which silently
 * dropped every aligned placement onto the default chain.
 */
export function preferenceChain(placement: Placement): Placement[] {
  const { side, align } = parsePlacement(placement);
  const opposite = OPPOSITE_SIDE[side];
  const perpendicular: PlacementSide[] =
    side === 'top' || side === 'bottom' ? ['right', 'left'] : ['bottom', 'top'];

  // The requested alignment on a given side, then that side's other alignments.
  const exact = (s: PlacementSide): Placement =>
    (align ? `${s}-${align}` : s) as Placement;
  const rest = (s: PlacementSide): Placement[] =>
    (align
      ? [s, `${s}-${align === 'start' ? 'end' : 'start'}`]
      : [`${s}-start`, `${s}-end`]) as Placement[];

  return [
    exact(side),
    exact(opposite),        // flip first — the only move that fixes side-axis overflow
    ...rest(side),
    ...rest(opposite),
    ...perpendicular.flatMap((s) => [exact(s), ...rest(s)]),
  ];
}

/**
 * Map a `Placement` onto `computeAnchoredPosition`'s inputs, so dropdown-style
 * components (ty-select, ty-date-picker) accept the same `placement` vocabulary
 * as ty-popup / ty-tooltip.
 *
 * Dropdowns only ever live above or below their trigger, so a left/right
 * placement degrades to "auto" side while keeping its alignment. Bare sides
 * default to start-aligned, matching a native <select> and the behaviour these
 * components had before `placement` existed.
 */
export function placementToAnchored(
  placement?: Placement | '' | null
): { side: 'top' | 'bottom' | 'auto'; align: 'start' | 'center' | 'end' } {
  if (!placement) return { side: 'auto', align: 'start' };
  const { side, align } = parsePlacement(placement);
  return {
    side: side === 'top' || side === 'bottom' ? side : 'auto',
    align: align ?? 'start',
  };
}

/**
 * Get element dimensions relative to viewport with calculated center points
 */
function getElementRect(el: HTMLElement): ElementRect {
  const rect = el.getBoundingClientRect();
  return {
    top: rect.top,
    left: rect.left,
    right: rect.right,
    bottom: rect.bottom,
    width: rect.width,
    height: rect.height,
    centerX: rect.left + rect.width / 2,
    centerY: rect.top + rect.height / 2,
  };
}

/**
 * Get viewport dimensions and scroll position
 */
function getViewportRect(): ViewportRect {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    scrollX: window.scrollX,
    scrollY: window.scrollY,
  };
}

/**
 * Calculate position for a specific placement
 * Returns x, y coordinates and overflow information
 */
function calculatePlacement(options: CalculatePlacementOptions): PositionResult {
  const {
    targetRect,
    floatingRect,
    placement,
    offset,
    padding,
    scrollbarWidth,
    containerPadding,
  } = options;

  const config = placements[placement];
  const { vertical, horizontal, orientation } = config;
  const viewport = getViewportRect();

  let x: number;
  if (orientation === 'vertical') {
    // Left/right placements
    if (horizontal === 'start') {
      x = targetRect.left - floatingRect.width - offset + containerPadding;
    } else {
      x = targetRect.right + offset - containerPadding;
    }
  } else {
    // Top/bottom placements. containerPadding is the floating element's
    // transparent wrap (shadow room) — the VISIBLE panel is inset by it, so
    // aligned edges must shift the box outward to bring the panel flush.
    if (horizontal === 'start') {
      x = targetRect.left - containerPadding;
    } else if (horizontal === 'center') {
      x = targetRect.centerX - floatingRect.width / 2;
    } else {
      x = targetRect.right - floatingRect.width + containerPadding;
    }
  }

  let y: number;
  if (orientation === 'vertical') {
    // Left/right placements
    if (vertical === 'center') {
      y = targetRect.centerY - floatingRect.height / 2;
    } else if (vertical === 'end') {
      // Bottom edges flush (left-end / right-end): shift the box DOWN by the
      // wrap so the visible panel's bottom lands on the trigger's bottom.
      // The old `- containerPadding` had the sign flipped — the panel sat
      // 2×wrap above flush.
      y = targetRect.bottom - floatingRect.height + containerPadding;
    } else {
      // Top edges flush (left-start / right-start): shift the box UP by the
      // wrap so the visible panel's top lands on the trigger's top.
      y = targetRect.top - containerPadding;
    }
  } else {
    // Top/bottom placements
    if (vertical === 'top') {
      y = targetRect.top - floatingRect.height - offset + containerPadding;
    } else {
      y = targetRect.bottom + offset - containerPadding;
    }
  }

  const overflow: OverflowData = {
    top: Math.min(0, y - padding),
    left: Math.min(0, x - padding),
    bottom: Math.min(0, viewport.height - (y + floatingRect.height + padding)),
    right: Math.min(0, viewport.width - (x + floatingRect.width + padding + scrollbarWidth)),
  };

  // Sum of absolute overflow values
  const overflowAmount = Object.values(overflow).reduce(
    (sum, val) => sum + Math.abs(val),
    0
  );

  return {
    x: Math.round(x),
    y: Math.round(y),
    placement,
    overflow,
    overflowAmount,
    fits: overflowAmount === 0,
  };
}

/**
 * Find the best position for the floating element
 * Tries all preference placements and returns the one that fits best
 */
export function findBestPosition(options: PositionOptions): PositionResult {
  const {
    targetEl,
    floatingEl,
    preferences = placementPreferences.default,
    offset = 8,
    padding = 8,
    containerPadding = 0,
  } = options;

  const targetRect = getElementRect(targetEl);
  const floatingRect = getElementRect(floatingEl);
  const scrollbarWidth = 15;

  const candidates = preferences.map(placement =>
    calculatePlacement({
      targetRect,
      floatingRect,
      placement,
      offset,
      padding,
      containerPadding,
      scrollbarWidth,
    })
  );

  // Find first that fits, or one with least overflow
  const bestPosition = candidates.find(c => c.fits) ||
    candidates.reduce((best, current) =>
      current.overflowAmount < best.overflowAmount ? current : best
    );

  // Adjust for scrollbar if needed
  if (bestPosition.overflow.right < 0) {
    bestPosition.x += bestPosition.overflow.right;
  }

  return bestPosition;
}

// Anchored modal popups (select, date-picker)

/**
 * Below/above placement for trigger-anchored `<dialog>` popups.
 *
 * Unlike findBestPosition (12-placement engine for non-modal floats), these
 * popups only ever open below or above their trigger, and their CSS anchors
 * with `top:` when below but `bottom:` when above — so both conventions are
 * returned and the caller picks by `below`.
 */
export interface AnchoredPopupOptions {
  anchorRect: DOMRect | ElementRect;
  popupWidth: number;
  popupHeight: number;
  /** Gap between trigger and popup edge (px, default 4) */
  gap?: number;
  /** Minimum distance from viewport edges (px, default 8) */
  padding?: number;
  /** Horizontal anchor edge: trigger's left edge ("start", default), its
   *  right edge ("end"), or centred on it. Either way the result is clamped
   *  into the viewport, same as before. */
  align?: "start" | "center" | "end";
  /** Preferred vertical side. "auto" (default) keeps the historic behaviour:
   *  below when it fits, otherwise whichever side has more room. Naming a
   *  side honours it when it fits and still flips rather than clipping. */
  side?: "top" | "bottom" | "auto";
}

export interface AnchoredPopupPosition {
  /** Popup left edge, viewport coords, clamped into view */
  x: number;
  /** CSS `top` value when below */
  topY: number;
  /** CSS `bottom` value when above */
  bottomY: number;
  below: boolean;
}

export function computeAnchoredPosition(o: AnchoredPopupOptions): AnchoredPopupPosition {
  const gap = o.gap ?? 4;
  const padding = o.padding ?? 8;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const spaceBelow = vh - o.anchorRect.bottom;
  const spaceAbove = o.anchorRect.top;

  const needed = o.popupHeight + gap + padding;
  const fitsBelow = spaceBelow >= needed;
  const fitsAbove = spaceAbove >= needed;

  // "auto": below when it fits — and when neither side fits, the side with MORE
  // room instead of blindly flipping up (a trigger near the viewport top used
  // to clip the popup off-screen).
  // A named side is honoured when it fits, and still flips rather than clipping
  // when it doesn't; if neither fits we fall back to the roomier side.
  const side = o.side ?? "auto";
  const below =
    side === "bottom" ? (fitsBelow || !fitsAbove ? true : false)
      : side === "top" ? (fitsAbove || !fitsBelow ? false : true)
        : fitsBelow || spaceBelow >= spaceAbove;

  // Anchor to the trigger's left edge ("start"), right edge ("end"), or centre,
  // clamped into the viewport either way.
  const rawX =
    o.align === "end" ? o.anchorRect.right - o.popupWidth
      : o.align === "center"
        ? o.anchorRect.left + (o.anchorRect.width - o.popupWidth) / 2
        : o.anchorRect.left;
  const x = Math.max(padding, Math.min(rawX, vw - o.popupWidth - padding));

  return {
    x,
    topY: o.anchorRect.bottom + gap,
    bottomY: vh - o.anchorRect.top + gap,
    below,
  };
}

