/**
 * Converts a time string in the format "HH:MM" to the total number of minutes.
 * @param time
 */
export function time_functions_utils(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Converts a total number of minutes to a time string in the format "HH:MM".
 * @param totalMinutes
 */
export function minutesToTime(totalMinutes: number): string {
  totalMinutes = totalMinutes % (24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${hours}:${mins.toString().padStart(2, '0')}`;
}
