import { inject, Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  AnalysisEvent,
  WorkerInMessage,
  WorkerOutMessage,
} from './audio-analysis-types';

/**
 * AudioAnalyzerService
 *
 * Analyses an audio file against ITU-R BS.1770-4 / EBU R128 and returns
 * a stream of progress events followed by the final {@link AudioAnalysisReport}.
 *
 * Architecture
 * ─────────────
 *  1. Main thread: decode the file via Web Audio API (AudioContext.decodeAudioData).
 *     The decoded PCM channel data is extracted as transferable Float32Arrays
 *     (AudioBuffer itself is NOT transferable).
 *
 *  2. Worker thread: receives the channel data and runs the full analysis
 *     (K-weighting, LUFS gating, True Peak, LRA, SNR…) without blocking the UI.
 *
 *  3. Main thread: receives progress events and the final report via postMessage,
 *     re-enters Angular's zone so change detection fires correctly.
 *
 * Usage
 * ─────
 *   const sub = this.analyzer.analyze(file).subscribe({
 *     next: event => {
 *       if (event.type === 'progress') console.log(event.phase, event.percent);
 *       if (event.type === 'result')   console.log(event.report);
 *     },
 *   });
 *   // Unsubscribing terminates the worker immediately.
 *
 * Supported formats
 * ─────────────────
 *   WAV, MP3, OGG/Vorbis, FLAC, AAC — anything the browser's AudioContext
 *   can decode. Format support is browser-dependent.
 */
@Injectable({ providedIn: 'root' })
export class AudioAnalyzerService {

  private zone = inject(NgZone);

  analyze(file: File): Observable<AnalysisEvent> {
    return new Observable<AnalysisEvent>(observer => {

      const worker = new Worker(
        new URL('./audio-analyzer.worker', import.meta.url),
        { type: 'module' },
      );

      let audioCtx: AudioContext | null = null;

      // ── Decode + transfer ────────────────────────────────────────────────

      const run = async () => {

        // Read file as ArrayBuffer (stays on main thread)
        const arrayBuffer = await file.arrayBuffer();

        this.zone.run(() =>
          observer.next({ type: 'progress', phase: 'decoding', percent: 0 })
        );

        // Decode PCM — requires AudioContext (not available in Worker)
        audioCtx = new AudioContext();
        const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
        await audioCtx.close();
        audioCtx = null;

        this.zone.run(() =>
          observer.next({ type: 'progress', phase: 'decoded', percent: 5 })
        );

        // Extract channel data as transferable copies.
        // audioBuffer.getChannelData() returns a view into a non-transferable
        // internal buffer — .slice() creates an independent copy.
        const channelBuffers: ArrayBuffer[] = [];
        const transfers: Transferable[]     = [];

        for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
          const copy = audioBuffer.getChannelData(c).slice().buffer;
          channelBuffers.push(copy);
          transfers.push(copy);
        }

        const msg: WorkerInMessage = {
          channelBuffers,
          sampleRate: audioBuffer.sampleRate,
          duration:   audioBuffer.duration,
        };

        // Zero-copy transfer: channelBuffers are detached from main thread
        worker.postMessage(msg, transfers);
      };

      // ── Worker message handler ───────────────────────────────────────────

      worker.onmessage = ({ data }: MessageEvent<WorkerOutMessage>) => {
        this.zone.run(() => {
          switch (data.type) {
            case 'progress':
              observer.next({ type: 'progress', phase: data.phase, percent: data.percent });
              break;
            case 'result':
              observer.next({ type: 'result', report: data.report });
              observer.complete();
              worker.terminate();
              break;
            case 'error':
              observer.error(new Error(data.message));
              worker.terminate();
              break;
          }
        });
      };

      worker.onerror = (err: ErrorEvent) => {
        this.zone.run(() => {
          observer.error(new Error(err.message ?? 'Worker error'));
          worker.terminate();
        });
      };

      run().catch(err => {
        this.zone.run(() => {
          observer.error(err instanceof Error ? err : new Error(String(err)));
          worker.terminate();
          audioCtx?.close();
        });
      });

      // ── Teardown (unsubscribe / take(1) etc.) ────────────────────────────
      return () => {
        worker.terminate();
        audioCtx?.close().catch(() => {});
      };
    });
  }
}
