export function formatPercentage(value: number, precision: number = 1): string {
  if (isNaN(value)) {
    return '0.0%'
  }

  return `${value.toFixed(precision)}%`
}

export function calculatePercentage(numerator: number, denominator: number): number {
  if (denominator === 0 || isNaN(denominator)) {
    return 0
  }

  return (numerator / denominator) * 100
}

export function formatAsPercentage(numerator: number, denominator: number, precision: number = 1): string {
  const percentage = calculatePercentage(numerator, denominator)
  return formatPercentage(percentage, precision)
}
