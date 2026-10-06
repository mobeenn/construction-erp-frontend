/** Format a number as PKR currency (compact by default). */
export function formatMoney(value, { compact = false, currency = "PKR" } = {}) {
   const n = Number(value) || 0;
   if (compact) {
      const abs = Math.abs(n);
      const sign = n < 0 ? "-" : "";
      if (abs >= 1_000_000_000) return `${currency} ${(abs / 1_000_000_000).toFixed(1)}B`;
      if (abs >= 1_000_000) return `${currency} ${(abs / 1_000_000).toFixed(1)}M`;
      if (abs >= 1_000) return `${currency} ${(abs / 1_000).toFixed(1)}K`;
      return `${currency} ${sign}${abs.toLocaleString()}`;
   }
   return `${currency} ${n.toLocaleString()}`;
}

export function formatNumber(value, digits = 0) {
   const n = Number(value) || 0;
   return n.toLocaleString(undefined, { maximumFractionDigits: digits });
}

export function formatPercent(value, digits = 0) {
   const n = Number(value) || 0;
   return `${n.toFixed(digits)}%`;
}

export function initials(name = "") {
   return name
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
}
