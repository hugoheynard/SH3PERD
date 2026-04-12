# SH3PHERD — AI Mastering

Architecture and TODO for the AI mastering feature, based on
[DeepAFx-ST](https://github.com/adobe-research/DeepAFx-ST) (Adobe
Research, Apache 2.0).

---

## Context — current mastering

Today, SH3PHERD masters tracks via `ffmpeg loudnorm` (two-pass,
ITU-R BS.1770-4). This normalises the integrated loudness (LUFS),
true peak (dBTP), and loudness range (LRA) to user-specified targets.

**What it does well:** deterministic loudness calibration, fast
(~5-10 s per track on CPU), industry-standard measurement.

**What it doesn't do:** EQ correction, dynamic compression shaping,
spectral balancing, tonal matching to a reference. A "mastered"
track is really a "loudness-normalised" track — the timbre, frequency
balance, and dynamics are untouched.

---

## Proposed upgrade — DeepAFx-ST autodiff

### What it is

DeepAFx-ST is a style-transfer framework for audio effects. Given an
input recording and a style reference, it predicts the control
parameters of a DSP audio effects chain so the input sounds like the
reference. The key innovation: **the effects are real DSP** (not a
black-box neural network) — a parametric EQ and a compressor
implemented as differentiable PyTorch operators. The neural network
only predicts the knob settings; the processing itself is physically
accurate and interpretable.

### The autodiff mastering chain

Two processors in series, 24 parameters total:

#### Parametric EQ — 6 bands, 18 parameters

| Band | Type | Frequency range | Gain | Q |
|------|------------|-----------------|-----------|---------|
| 1 | Low-shelf | 20 – 200 Hz | ±24 dB | 0.1 – 10 |
| 2 | Peaking | 200 – 2 000 Hz | ±24 dB | 0.1 – 10 |
| 3 | Peaking | 800 – 4 000 Hz | ±24 dB | 0.1 – 10 |
| 4 | Peaking | 2 000 – 8 000 Hz | ±24 dB | 0.1 – 10 |
| 5 | Peaking | 4 000 – 10.8 kHz | ±24 dB | 0.1 – 10 |
| 6 | High-shelf | 4 000 – 10.8 kHz | ±24 dB | 0.1 – 10 |

Chain order: Low-shelf → Band 1 → Band 2 → Band 3 → Band 4 → High-shelf.

#### Dynamic range compressor — 6 parameters

| Parameter | Range | Default |
|-----------|-------------------|---------|
| Threshold | -80 → 0 dB | -12 dB |
| Ratio | 1:1 → 20:1 | 2:1 |
| Attack | 0.1 ms → 100 ms | 1 ms |
| Release | 5 ms → 1 000 ms | 45 ms |
| Knee | 0 → 12 dB | 6 dB |
| Makeup gain | -48 → +48 dB | 0 dB |

**No limiter** in the chain. **No LUFS target** in the model.

### Performance (benchmarks from the paper)

Machine: Intel Xeon E5-2623 v3 (16-core) + GeForce GTX 1080 Ti.

| Mode | RTF | 4 min track | Hardware |
|------|------|-------------|----------|
| autodiff GPU | 0.001 | **~0.24 s** | GTX 1080 Ti |
| autodiff CPU | 0.006 | **~1.4 s** | Xeon 16-core |
| tcn1 GPU | 0.002 | ~0.5 s | GTX 1080 Ti |
| tcn1 CPU | 0.13 | ~31 s | Xeon 16-core |
| tcn2 GPU | 0.005 | ~1.1 s | GTX 1080 Ti |
| tcn2 CPU | 0.27 | ~64 s | Xeon 16-core |

RTF = Real-Time Factor (processing time / audio duration).

**Autodiff on CPU (~1.4 s for 4 minutes) is the sweet spot**: fast
enough for synchronous API response, no GPU required, and the
predicted parameters are interpretable because the effects are real
DSP (not a black-box TCN).

---

## Two-stage pipeline

DeepAFx-ST does not support a target LUFS natively. The solution
is a **two-stage pipeline** that combines AI-driven tonal mastering
with the existing loudness calibration:

```
┌─────────────────────────────────────────────────────────┐
│ Stage 1: DeepAFx-ST autodiff                            │
│                                                         │
│  Input track ──┐                                        │
│                ├──→ Neural controller ──→ EQ params      │
│  Reference* ───┘    (encoder)            Compressor     │
│                                          params         │
│                          │                              │
│                          ▼                              │
│               Differentiable DSP chain                  │
│               (PEQ 6-band → Compressor)                 │
│                          │                              │
│                          ▼                              │
│               Tonally mastered track                    │
│               (balanced EQ + controlled dynamics)       │
│               (loudness NOT calibrated yet)             │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│ Stage 2: ffmpeg loudnorm (existing code, unchanged)     │
│                                                         │
│  Tonally mastered track ──→ Pass 1 (measure) ──→        │
│  Pass 2 (normalize to target LUFS / LRA / TP)          │
│                                                         │
│  User controls:                                         │
│    • Target integrated LUFS (-14, -16, -23…)            │
│    • Target LRA (optional)                              │
│    • Target true peak dBTP (-1, -2…)                    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
              Final mastered + calibrated track
              (stored as new track on the version)
```

*\* "Reference" is either a user-provided track or a built-in preset.*

### Why two stages

1. **DeepAFx-ST does the tonal work** — EQ that corrects frequency
   imbalances, compression that shapes the dynamics envelope. This is
   80 % of what a mastering engineer does by hand. It's the part
   that `ffmpeg loudnorm` cannot do.

2. **`ffmpeg loudnorm` does the calibration** — targets a specific
   LUFS / LRA / true peak. This is a measurement-and-adjust pass,
   not a creative decision. It's the part that DeepAFx-ST's neural
   controller has no mechanism to target.

3. **The two are independent** — a user who only wants loudness
   calibration (the current "Standard" mode) skips stage 1. A user
   who only wants AI tonal mastering without loudness conformance
   skips stage 2. A user who wants both gets the full pipeline.

---

## UX — three mastering modes

### Mode 1: Standard (existing, unchanged)

`ffmpeg loudnorm` two-pass. User provides:
- Target LUFS (e.g. -14 for Spotify)
- Target true peak dBTP (e.g. -1)
- Target LRA (optional)

Result: loudness-normalised track. ~5-10 s.

### Mode 2: AI Master (reference-based)

Two-stage pipeline. User provides:
- A **reference track** (upload or pick from their library)
- Target LUFS / LRA / TP (defaults to -14 LUFS / -1 dBTP)

DeepAFx-ST analyses both tracks, predicts the EQ + compressor
settings to make the input sound like the reference, applies them,
then `ffmpeg loudnorm` calibrates to the LUFS target.

Result: tonally mastered + loudness-calibrated track. ~3-8 s.

### Mode 3: AI Master Full Auto

Two-stage pipeline with zero user input. Uses a **built-in preset
reference** (a professionally mastered track embedded in the
processor) and a default LUFS target of -14.

One-click mastering. The user just clicks "Master" and gets a
production-ready track.

Result: tonally mastered + loudness-calibrated track. ~3-8 s.

---

## Built-in reference presets

Ship 3-5 professionally mastered tracks as embedded assets in the
audio-processor service. Each preset targets a different sonic
profile:

| Preset | Profile | Use case |
|--------|---------|----------|
| `streaming` | Modern, punchy, wide stereo | Spotify, Apple Music, YouTube |
| `vinyl` | Warm, dynamic, less compressed | Vinyl pressing, audiophile |
| `broadcast` | Loud, compressed, clear voice | Radio, TV, podcast |
| `acoustic` | Natural, transparent, minimal processing | Classical, jazz, folk |
| `electronic` | Tight low-end, aggressive compression | EDM, techno, hip-hop |

Each preset is a ~30 s WAV file (enough for DeepAFx-ST to extract
the style) stored in `apps/audio-processor/assets/presets/`.

---

## Interpretable output — "what the AI did"

Because the predicted parameters are real DSP values (not latent
vectors), we can show the user exactly what happened:

```json
{
  "eq": {
    "lowShelf":  { "freq": 80,   "gain": 2.4,  "q": 0.7 },
    "band1":     { "freq": 350,  "gain": -1.2, "q": 1.5 },
    "band2":     { "freq": 1200, "gain": 0.8,  "q": 2.0 },
    "band3":     { "freq": 3500, "gain": 1.6,  "q": 1.8 },
    "band4":     { "freq": 7000, "gain": -0.5, "q": 0.9 },
    "highShelf": { "freq": 8500, "gain": 3.1,  "q": 0.7 }
  },
  "compressor": {
    "threshold": -18.5,
    "ratio": 3.2,
    "attack": 0.012,
    "release": 0.15,
    "knee": 6.0,
    "makeupGain": 4.2
  }
}
```

This data can be:
- **Displayed on the track card** as an EQ curve visualisation +
  compressor summary.
- **Stored on the track** alongside the analysis snapshot for
  future reference.
- **Used as a starting point** for a future "manual tweak" UI where
  the user adjusts the AI-predicted parameters before re-rendering.

No commercial mastering service (LANDR, CloudBounce, eMastered)
exposes this level of transparency. It's a real differentiator.

---

## Integration architecture

### Principle: Python as a CLI tool, not a service

The Python worker follows the **exact same pattern** as `ffmpeg` in
the existing codebase: a CLI binary that `audio-processor` spawns via
`child_process.execFile`, waits for it to finish, reads the output.
No server, no port, no lifecycle management, no changes to the
monorepo structure.

```
audio-processor (NestJS, long-running TCP microservice)
    │
    ├── spawn('ffmpeg', [...])             ← existing (decode, loudnorm, pitch-shift)
    ├── spawn('ffprobe', [...])            ← existing (probe sample rate / channels)
    └── spawn('python3', ['python/deepafx_worker.py', ...])  ← NEW, same pattern
```

The worker:
1. Starts, loads the PyTorch checkpoint (~2 s cold, cacheable)
2. Reads input + reference audio files from disk (pre-downloaded from R2)
3. Runs inference (~1.4 s on CPU for a 4-min track)
4. Writes the processed audio to an output file
5. Prints predicted parameters as JSON to stdout
6. Exits (process 0)

### File layout

Everything lives inside the existing `apps/audio-processor/` — no
new workspace, no new service, no change to `pnpm-workspace.yaml`
or `turbo.json`:

```
apps/audio-processor/
├── src/
│   ├── core/
│   │   ├── analyze.ts            (existing — spawn ffmpeg + ffprobe + Essentia)
│   │   ├── master.ts             (existing — spawn ffmpeg loudnorm)
│   │   ├── pitch-shift.ts        (existing — spawn ffmpeg rubberband)
│   │   └── ai-master.ts          (NEW — spawn python3 deepafx_worker.py)
│   └── ...
├── python/                        (NEW — the CLI script + its deps)
│   ├── deepafx_worker.py          (~80 lines: argparse, load model, infer, output JSON)
│   └── requirements.txt           (deepafx-st, torch, torchaudio, soundfile, numpy)
├── assets/
│   ├── presets/                   (NEW — reference WAV files, ~30 s each)
│   │   ├── streaming.wav
│   │   ├── vinyl.wav
│   │   ├── broadcast.wav
│   │   ├── acoustic.wav
│   │   └── electronic.wav
│   └── checkpoints/               (NEW — pre-trained DeepAFx-ST autodiff model)
│       └── autodiff_mastering.ckpt
├── Dockerfile
└── package.json
```

### Dockerfile changes

The existing `Dockerfile` already installs `ffmpeg` as a system
dependency. Python is added the same way:

```dockerfile
# ── Existing system deps ─────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg

# ── NEW: Python + DeepAFx-ST deps ───────────
RUN apt-get install -y --no-install-recommends \
    python3 python3-pip python3-venv

# Install Python deps in a venv to avoid system pollution
RUN python3 -m venv /opt/deepafx-venv
COPY python/requirements.txt /app/python/
RUN /opt/deepafx-venv/bin/pip install --no-cache-dir -r /app/python/requirements.txt

# Copy the worker script + assets
COPY python/ /app/python/
COPY assets/ /app/assets/

# The NestJS code spawns: /opt/deepafx-venv/bin/python3 /app/python/deepafx_worker.py
```

Image size impact: PyTorch CPU-only (~400 MB) + DeepAFx-ST (~50 MB)
+ checkpoint (~100 MB) ≈ **+550 MB** on top of the existing image.
Acceptable for a microservice that already carries ffmpeg + Essentia.

### The subprocess bridge in TypeScript

```ts
// apps/audio-processor/src/core/ai-master.ts

import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);

const PYTHON = process.env.DEEPAFX_PYTHON ?? '/opt/deepafx-venv/bin/python3';
const WORKER = path.join(__dirname, '../../python/deepafx_worker.py');
const CHECKPOINT = path.join(__dirname, '../../assets/checkpoints/autodiff_mastering.ckpt');

export async function aiMaster(input: {
  inputPath: string;
  referencePath: string;
  outputPath: string;
}): Promise<TAiMasterPredictedParams> {
  const { stdout } = await exec(PYTHON, [
    WORKER,
    '--input', input.inputPath,
    '--reference', input.referencePath,
    '--output', input.outputPath,
    '--checkpoint', CHECKPOINT,
  ], { timeout: 60_000 });

  return JSON.parse(stdout) as TAiMasterPredictedParams;
}
```

This is the same `execFile` + `await` pattern used in `analyze.ts`
for `ffmpeg` and `ffprobe`. The handler does:

1. Download input + reference from R2 to `/tmp/` (existing S3Service)
2. Call `aiMaster({ inputPath, referencePath, outputPath })`
3. Optionally run `ffmpeg loudnorm` on the output (stage 2)
4. Upload the final file to R2 (existing S3Service)
5. Return the predicted params + S3 key

### Cold start and future optimisation

Each `python3 deepafx_worker.py` invocation loads PyTorch + the
checkpoint from disk: ~2 s overhead. Total time per call: ~3.5 s
for a 4-min track (2 s cold + 1.4 s inference).

This is fine for v1 — the current `ffmpeg loudnorm` mastering takes
~5-10 s, so the AI master is actually **faster** end-to-end.

If cold start becomes a bottleneck (many concurrent masters), the
upgrade path is:

1. **Model caching via `--daemon` mode** — the Python script stays
   alive between calls, listening on stdin for new jobs. The TS
   side maintains a reference to the child process and writes jobs
   as newline-delimited JSON. Avoids the 2 s reload.

2. **HTTP sidecar** — the Python script becomes a tiny FastAPI server
   with the model pre-loaded. The TS side calls `fetch()` instead of
   `execFile()`. Only needed under sustained concurrency (>5 masters
   per minute).

Neither requires changes to the monorepo structure — they're runtime
optimisations within `apps/audio-processor/`.

### New backend types

```ts
// In shared-types
export interface TAiMasterTrackPayload {
  s3Key: string;
  outputS3Key: string;
  trackId: TVersionTrackId;
  versionId: TMusicVersionId;
  ownerId: TUserId;
  /** Reference audio — either a preset name or an S3 key. */
  reference: { type: 'preset'; name: string } | { type: 's3Key'; key: string };
  /** Optional LUFS target for stage 2. null = skip loudnorm. */
  targetLUFS: number | null;
  /** Optional true peak target for stage 2. */
  targetTP: number | null;
  /** Optional LRA target for stage 2. */
  targetLRA: number | null;
}

export interface TAiMasterResult {
  masteredS3Key: string;
  sizeBytes: number;
  /** The predicted DSP parameters — interpretable by the frontend. */
  predictedParams: {
    eq: Array<{ type: string; freq: number; gain: number; q: number }>;
    compressor: {
      threshold: number;
      ratio: number;
      attack: number;
      release: number;
      knee: number;
      makeupGain: number;
    };
  };
  /** ffmpeg loudnorm report (stage 2), if stage 2 was requested. */
  loudnormReport?: string;
}
```

### New microservice pattern

```ts
export const MicroservicePatterns = {
  AudioProcessor: {
    ANALYZE_TRACK:    'analyze_track',
    MASTER_TRACK:     'master_track',
    PITCH_SHIFT_TRACK: 'pitch_shift_track',
    AI_MASTER_TRACK:  'ai_master_track',   // NEW
  },
} as const;
```

### New backend command

```
POST /music/versions/:versionId/tracks/:trackId/ai-master
Body: {
  mode: 'reference' | 'auto',
  referenceVersionId?: TMusicVersionId,   // for mode=reference
  referenceTrackId?: TVersionTrackId,     // for mode=reference
  preset?: string,                        // for mode=auto (default: 'streaming')
  targetLUFS?: number,                    // default: -14
  targetTP?: number,                      // default: -1
  targetLRA?: number,                     // default: null (no constraint)
}
```

### Frontend UI

New section in the mastering modal / side panel:

```
┌────────────────────────────────────────────┐
│ Master this track                          │
│                                            │
│ ○ Standard (loudness only)                 │
│ ○ AI Master (choose a reference)           │
│   └ [dropdown: from my library / upload]   │
│ ● AI Master (full auto)                    │
│   └ Preset: [streaming ▾]                  │
│                                            │
│ Target LUFS: [-14    ]  TP: [-1 dBTP]      │
│ LRA:         [auto   ]                     │
│                                            │
│ [Master]                                   │
└────────────────────────────────────────────┘
```

After mastering, the track detail shows:
- The EQ curve (SVG visualisation of the 6-band parametric EQ)
- Compressor settings summary (ratio, threshold, attack/release)
- Before/after loudness comparison (LUFS, LRA, TP)

---

## TODO — ordered by implementation sequence

### Phase 1: Python worker script (~1 day)
- [ ] Create `apps/audio-processor/python/` directory.
- [ ] Write `deepafx_worker.py` (~80 lines): argparse CLI that loads
      the checkpoint, reads `--input` + `--reference` WAVs from disk,
      runs autodiff inference, writes `--output` WAV, prints the
      predicted EQ + compressor params as JSON to stdout, then exits.
- [ ] Write `requirements.txt`: `deepafx-st`, `torch` (CPU-only),
      `torchaudio`, `soundfile`, `numpy`.
- [ ] Download the pre-trained autodiff checkpoint from the DeepAFx-ST
      releases → `assets/checkpoints/autodiff_mastering.ckpt`.
- [ ] Ship 3 reference presets → `assets/presets/{streaming,vinyl,broadcast}.wav`
      (30 s professionally mastered WAV each).
- [ ] Test standalone:
      `python3 python/deepafx_worker.py --input test.wav --reference presets/streaming.wav --output out.wav`
      → verify audio output + JSON params on stdout.
- [ ] Update `Dockerfile` to install `python3 + python3-pip + venv`
      and `pip install -r python/requirements.txt` in a venv.

### Phase 2: TypeScript subprocess bridge (~0.5 day)
- [ ] Write `apps/audio-processor/src/core/ai-master.ts`:
      `execFile('python3', ['deepafx_worker.py', ...])` bridge, same
      pattern as `ffmpeg` in `analyze.ts` / `master.ts`.
- [ ] Parse stdout JSON into `TAiMasterPredictedParams`.
- [ ] Compose the two-stage pipeline: `aiMaster()` → optional
      `masterAudio()` (existing loudnorm pass-2).
- [ ] Add `AI_MASTER_TRACK` message pattern in the TCP controller.
- [ ] Add `TAiMasterTrackPayload` / `TAiMasterResult` to
      shared-types + `MicroservicePatterns`.

### Phase 3: Backend command + endpoint (~0.5 day)
- [ ] `AiMasterTrackCommand` in the music application layer.
- [ ] `POST /music/versions/:versionId/tracks/:trackId/ai-master`
      endpoint with Zod validation.
- [ ] Permission: `P.Music.Track.Write` (same as existing master).
- [ ] Store predicted params in the track's domain model (new optional
      field `masteringParams` on `TVersionTrackDomainModel`).
- [ ] Return the predicted params in the API response so the frontend
      can display them immediately.

### Phase 4: Frontend UI (~1 day)
- [ ] Mastering mode selector in the version actions / side panel.
- [ ] Reference picker (dropdown from library versions, or upload).
- [ ] Preset picker for full-auto mode.
- [ ] LUFS / TP / LRA target inputs (with streaming/vinyl/broadcast
      quick-fill buttons).
- [ ] EQ curve SVG visualisation component (draws the 6-band frequency
      response from the predicted params).
- [ ] Compressor settings display (threshold, ratio, attack/release).
- [ ] Before/after LUFS comparison badge.

### Phase 5: Optimisation (later, when needed)
- [ ] **Daemon mode**: keep the Python process alive between calls
      with a stdin/stdout JSON protocol. Eliminates the ~2 s PyTorch
      cold start per invocation. Still not a service — just a long-
      running child process managed by the NestJS handler.
- [ ] **Concurrency guard**: max 2 concurrent AI masters to avoid OOM
      (PyTorch allocates ~1-2 GB RSS per inference on CPU).
- [ ] **Fallback**: if `python3` is not installed or the worker
      crashes, surface a clear error and offer Standard mode.
- [ ] **Telemetry**: log inference time, predicted params summary,
      and LUFS delta (before vs after) for quality monitoring.

---

## Estimated effort

| Phase | Effort |
|-------|--------|
| Python worker script + Dockerfile + presets | 1 day |
| TypeScript subprocess bridge + shared types | 0.5 day |
| Backend command + endpoint | 0.5 day |
| Frontend UI | 1 day |
| **Total v1** | **~3 days** |
| Daemon mode + concurrency guard (later) | 0.5 day |

---

## Alternatives considered

### Matchering (sergree/matchering)

Reference-based mastering via spectral matching (not ML). Matches
RMS, frequency response, peak amplitude, and stereo width from a
reference track.

**Pro:** simpler (pure DSP, no PyTorch), lighter (~100 MB vs ~2 GB),
CPU-only, very fast.
**Con:** no learned intelligence — it copies the reference's spectral
profile mechanically. Works well for "make my album consistent" but
poorly for "make this sound professional" when the reference and input
are in different genres.

Could be offered as a third mode ("Match Reference") alongside the
DeepAFx modes.

→ [GitHub](https://github.com/sergree/matchering)

### FxNorm-Automix (Sony)

Full mixing system from stems. Learns mixing decisions from
commercial releases.

**Pro:** end-to-end mixing, not just mastering.
**Con:** requires stem separation first (Demucs), much heavier
pipeline, overkill for the mastering use case.

Long-term option if SH3PHERD adds stem separation (see Tier 4 of
`sh3-music-library.md`).

→ [GitHub](https://github.com/sony/FxNorm-automix)

### Demucs v4 (Meta)

Stem separation, not mastering. Complementary: extract stems →
process individually → reassemble.

Long-term option, not needed for v1 mastering.

→ [GitHub](https://github.com/facebookresearch/demucs)

---

## Key architectural decisions

### Why autodiff mode over TCN?

| | autodiff | tcn1 / tcn2 |
|---|---|---|
| Speed (CPU) | ~1.4 s / 4 min | 31-64 s / 4 min |
| Parameters | Interpretable (EQ gains, comp ratio…) | Opaque (neural network weights) |
| GPU required? | No | Strongly recommended |
| Audio quality | Real DSP (physically accurate) | Neural approximation (artifacts possible) |

Autodiff wins on every axis that matters for SH3PHERD: fast enough
on CPU, interpretable output, no GPU dependency.

### Why two stages instead of one?

DeepAFx-ST has **no mechanism to target a specific LUFS**. Its loss
function matches the spectral envelope and dynamics of the reference,
but doesn't constrain the absolute loudness. Adding a LUFS term to
the loss would require retraining the model — possible but out of
scope.

The two-stage approach is simpler, modular (each stage can be used
independently), and reuses the existing `ffmpeg loudnorm` code
without modification.

### Why not just improve ffmpeg loudnorm?

`loudnorm` is a measurement-and-adjust algorithm. It doesn't make
creative decisions — it can't boost the bass because the genre needs
it, it can't tighten the transients because the track is too muddy.
That's what the AI stage does.

---

## Related docs

- `sh3-music-library.md` — music library roadmap (this feature is
  Tier 2 / #6)
- `sh3-music-audio-player.md` — audio player pipeline (where
  mastered tracks are played back)
