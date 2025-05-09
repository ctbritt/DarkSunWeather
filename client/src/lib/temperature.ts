// Convert Celsius to Fahrenheit
export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9/5) + 32);
}

// Convert Fahrenheit to Celsius
export function fahrenheitToCelsius(fahrenheit: number): number {
  return Math.round((fahrenheit - 32) * 5/9);
}

// Format temperature with unit
export function formatTemperature(celsius: number, unit: 'C' | 'F' = 'F'): string {
  const temp = unit === 'F' ? celsiusToFahrenheit(celsius) : celsius;
  return `${temp}°${unit}`;
} 