export interface Promo {
  code: string;
  title: string;
  description: string;
  percent: number;
  minSubtotal: number;
}

export const promos: Promo[] = [
  {
    code: "PITMASTER20",
    title: "Pitmaster Feast",
    description: "20% off any order over $80 — perfect for the ribs, brisket & sides spread.",
    percent: 20,
    minSubtotal: 80,
  },
  {
    code: "SMOKE1986",
    title: "Anniversary Deal",
    description: "15% off orders over $40 to celebrate 40 years of smoke.",
    percent: 15,
    minSubtotal: 40,
  },
  {
    code: "FIRSTBITE",
    title: "First Order",
    description: "10% off your first online order, no minimum.",
    percent: 10,
    minSubtotal: 0,
  },
];

export function findPromo(code: string) {
  return promos.find((p) => p.code === code.trim().toUpperCase());
}
