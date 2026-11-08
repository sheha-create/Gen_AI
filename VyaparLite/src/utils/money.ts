// All monetary values stored and computed in integer PAISE
// 1 INR = 100 paise

const inFormatter = new Intl.NumberFormat('en-IN', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function toRupees(paise: number): string {
  const abs = Math.abs(paise);
  const sign = paise < 0 ? '-' : '';
  const rupees = Math.floor(abs / 100);
  const p = abs % 100;
  const formattedRupees = inFormatter.format(rupees);
  return `${sign}₹${formattedRupees}.${p.toString().padStart(2, '0')}`;
}

export function formatRupees(paise: number): string {
  return toRupees(paise);
}

export function formatPaise(paise: number): string {
  return toRupees(paise);
}

export function multiplyPaise(paise: number, quantity: number): number {
  return Math.round(paise * quantity);
}

export function applyBpsTax(basePaise: number, taxRateBps: number): number {
  return Math.round((basePaise * taxRateBps) / 10000);
}

export function applyPercentDiscount(basePaise: number, percent: number): number {
  return Math.round((basePaise * percent) / 100);
}

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}
