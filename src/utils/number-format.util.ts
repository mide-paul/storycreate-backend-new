export function formatNumberWithSuffix(value: number): string {
  if (value < 1000) {
    return value.toString();
  }
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const suffixIndex = Math.floor(Math.log10(value) / 3);
  const shortValue = value / Math.pow(1000, suffixIndex);
  const formattedValue = shortValue.toFixed(shortValue < 10 ? 1 : 0);
  return formattedValue + suffixes[suffixIndex];
}
