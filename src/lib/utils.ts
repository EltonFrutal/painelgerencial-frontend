export function formatNumberShort(value: number): string {
    let formatted = "";
    let divisor = 1;
    let suffix = "";

    if (Math.abs(value) >= 1_000_000_000) {
        divisor = 1_000_000_000;
        suffix = "B";
    } else if (Math.abs(value) >= 1_000_000) {
        divisor = 1_000_000;
        suffix = "M";
    } else if (Math.abs(value) >= 1_000) {
        divisor = 1_000;
        suffix = "K";
    }

    const divided = value / divisor;
    const decimalPlaces = Math.abs(divided) >= 10 ? 1 : 2;

    formatted = divided.toLocaleString("pt-BR", {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces,
    });

    return `${formatted}${suffix}`;
}
