import { Histogram, Registry, collectDefaultMetrics } from 'prom-client';

/**
 * Prometheus registry + histograms for the audio-processor.
 *
 * Kept as module-level singletons rather than Nest providers so the
 * timer helper (`measure(...)`) stays stateless and can be called from
 * anywhere in the codebase without DI. One registry per process — that
 * matches how Prometheus scrapes a single `/metrics` endpoint.
 *
 * Default process metrics (event-loop lag, GC pauses, RSS) are
 * registered once at import time. Cheap, no sampling config, valuable
 * when debugging a stuck ffmpeg.
 */
export const registry = new Registry();
collectDefaultMetrics({ register: registry });

/**
 * `audio_processor_stage_duration_seconds`
 *
 * Labels:
 *   - `op`       — which operation pipeline the stage belongs to
 *                  (analyze / master / pitch_shift / ai_master)
 *   - `stage`    — the specific step inside the pipeline
 *                  (s3_download / s3_upload / ffmpeg_loudnorm /
 *                  ffmpeg_pitch / wasm_analysis / deepafx_inference …)
 *   - `outcome`  — 'success' | 'error' — so dashboards can show
 *                  error rate alongside latency.
 *
 * Buckets shaped for the observed range: analysis is sub-second,
 * mastering / pitch tens of seconds, AI mastering occasionally
 * minute-scale. Wider-than-usual top bucket to keep p99 meaningful.
 */
export const stageDurationHistogram = new Histogram({
  name: 'audio_processor_stage_duration_seconds',
  help: 'Duration of each audio-processor pipeline stage in seconds.',
  labelNames: ['op', 'stage', 'outcome'] as const,
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10, 20, 45, 90, 180],
  registers: [registry],
});

/**
 * Wrap an async stage with duration measurement. Records the elapsed
 * seconds under `{op, stage}` with the correct `outcome` label whether
 * the promise resolves or rejects — the latter is what lets us correlate
 * latency with failure modes without a separate error counter.
 */
export async function measure<T>(
  op: string,
  stage: string,
  fn: () => Promise<T>,
): Promise<T> {
  const end = stageDurationHistogram.startTimer({ op, stage });
  try {
    const result = await fn();
    end({ outcome: 'success' });
    return result;
  } catch (err) {
    end({ outcome: 'error' });
    throw err;
  }
}
