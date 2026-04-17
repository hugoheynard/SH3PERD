/**
 * Ambient type declarations for `essentia.js` (v0.1.3).
 *
 * The upstream package ships no `.d.ts`. This file describes only the surface
 * area we actually consume here (analyze.ts), so we can keep
 * `@typescript-eslint/no-unsafe-*` enforced without scattering eslint-disable
 * comments at every call site.
 *
 * If we ever start using more Essentia algorithms, extend the `Essentia` class
 * with their signatures from https://essentia.upf.edu/algorithms_reference.html
 */
declare module 'essentia.js' {
  /** Opaque WASM bundle returned from the package; passed to `new Essentia()`. */
  export type EssentiaWasmModule = unknown;

  /** WASM bytecode bundle that initialises Essentia. */
  export const EssentiaWASM: EssentiaWasmModule;

  /** Vector handle wrapping a typed-array buffer on the WASM heap. */
  export interface EssentiaVector {
    delete(): void;
    size(): number;
  }

  /** Result shape of `PercivalBpmEstimator`. */
  export interface BpmResult {
    bpm: number;
  }

  /** Result shape of `KeyExtractor`. */
  export interface KeyResult {
    key: string;
    scale: string;
    strength: number;
  }

  export class Essentia {
    constructor(wasmModule: EssentiaWasmModule);
    arrayToVector(samples: Float32Array): EssentiaVector;
    PercivalBpmEstimator(samples: EssentiaVector): BpmResult;
    KeyExtractor(samples: EssentiaVector): KeyResult;
  }
}
