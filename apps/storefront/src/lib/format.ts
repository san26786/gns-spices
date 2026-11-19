// Display helpers shared by server and client components.

/** Pack name: the saved label, or "<weight> · <packaging>". */
export const fmtPack = (weightGrams: number, packaging: string, label?: string | null) =>
  label ?? `${weightGrams >= 1000 ? `${weightGrams / 1000}kg` : `${weightGrams}g`} · ${packaging}`;

export const fmtMoney = (amount: number, currency = 'GBP') =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency }).format(amount);
