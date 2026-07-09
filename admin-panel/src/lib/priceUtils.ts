export function paisaToRupees(paisa: number): number { return paisa / 100; }
export function rupeesToPaisa(rupees: number): number { return Math.round(rupees * 100); }

export function formatPaisa(paisa: number): string {
  return new Intl.NumberFormat("en-PK", {
    style: "currency", currency: "PKR",
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(paisa / 100);
}