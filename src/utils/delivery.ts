export function getRemainingMs(
  order: {
    createdAt: number;
    estimatedMinutes: number;
    received: boolean;
    receivedAt: number | null;
  },
  now: number = Date.now()
): number {
  if (order.received) return 0;
  const deadline = order.createdAt + order.estimatedMinutes * 60 * 1000;
  return deadline - now;
}

export function getOverdueMs(
  order: {
    createdAt: number;
    estimatedMinutes: number;
    received: boolean;
  },
  now: number = Date.now()
): number {
  if (order.received) return 0;
  const deadline = order.createdAt + order.estimatedMinutes * 60 * 1000;
  return Math.max(0, now - deadline);
}

export function isOverdue(
  order: {
    createdAt: number;
    estimatedMinutes: number;
    received: boolean;
  },
  now: number = Date.now()
): boolean {
  if (order.received) return false;
  return now > order.createdAt + order.estimatedMinutes * 60 * 1000;
}

export function getRemainingRatio(
  order: {
    createdAt: number;
    estimatedMinutes: number;
    received: boolean;
    receivedAt: number | null;
  },
  now: number = Date.now()
): number {
  if (order.received) return 0;
  const totalMs = order.estimatedMinutes * 60 * 1000;
  const remaining = getRemainingMs(order, now);
  return Math.max(0, Math.min(1, remaining / totalMs));
}

export function formatRemaining(ms: number): string {
  if (ms <= 0) return "已送达";
  const totalSeconds = Math.ceil(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

const COLOR_BLUE: RGB = { r: 59, g: 130, b: 246 };
const COLOR_YELLOW: RGB = { r: 245, g: 158, b: 11 };
const COLOR_RED: RGB = { r: 239, g: 68, b: 68 };

function lerpColor(a: RGB, b: RGB, t: number): RGB {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function rgbToString(c: RGB): string {
  return `rgb(${c.r}, ${c.g}, ${c.b})`;
}

export function getBarColor(
  ratio: number,
  received: boolean,
  overdue: boolean = false
): string {
  if (received) return "rgb(107, 114, 128)";
  if (overdue) return rgbToString(COLOR_RED);
  if (ratio > 0.5) {
    const t = 1 - (ratio - 0.5) / 0.5;
    return rgbToString(lerpColor(COLOR_BLUE, COLOR_YELLOW, t));
  }
  const t = 1 - ratio / 0.5;
  return rgbToString(lerpColor(COLOR_YELLOW, COLOR_RED, t));
}

export function getBarGlow(
  ratio: number,
  received: boolean,
  overdue: boolean = false
): string {
  if (received) return "none";
  const color = getBarColor(ratio, false, overdue);
  if (overdue) {
    return `0 0 25px ${color.replace("rgb", "rgba").replace(")", ", 0.5)")}`;
  }
  return `0 0 20px ${color.replace("rgb", "rgba").replace(")", ", 0.3)")}`;
}
