/**
 * Converts a time string in the format "HH:MM" to the total number of minutes.
 * @param time
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}
