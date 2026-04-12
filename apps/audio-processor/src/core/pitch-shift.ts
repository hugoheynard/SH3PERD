/**
 * Pitch-shift an audio buffer by the given number of semitones.
 *
 * TODO: Implement using ffmpeg:
 *   ffmpeg -i input -af "asetrate=44100*2^(semitones/12),aresample=44100" -c:a pcm_s24le output.wav
 *
 * This changes the pitch without changing the tempo (via resample back to original rate).
 * For higher quality, consider using the rubberband library instead of ffmpeg's asetrate.
 *
 * @param audioBuffer - Raw audio file buffer (any format ffmpeg can decode)
 * @param semitones - Number of semitones to shift (positive = up, negative = down)
 * @returns Processed audio buffer (WAV 24-bit PCM)
 */
export async function pitchShift(audioBuffer: Buffer, semitones: number): Promise<Buffer> {
  // TODO: Implement pitch shifting
  throw new Error(`Pitch shift not implemented yet (requested ${semitones} semitones)`);
}
