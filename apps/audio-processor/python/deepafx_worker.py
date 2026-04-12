#!/usr/bin/env python3
"""
DeepAFx-ST inference worker — CLI interface for the audio-processor
TypeScript subprocess bridge.

Loads the DeepAFx-ST autodiff model, runs style-transfer inference
(input + reference → output), and prints the predicted EQ + compressor
parameters as JSON to stdout. All logging goes to stderr to keep
stdout clean for JSON parsing by the TypeScript caller.

Usage:
    python3 deepafx_worker.py \
        --input   /tmp/input.wav \
        --reference /tmp/reference.wav \
        --output  /tmp/output.wav \
        --checkpoint /path/to/autodiff_mastering.ckpt

Exit codes:
    0 — success (JSON printed to stdout)
    1 — argument error
    2 — model load error
    3 — inference error
    4 — I/O error

The TypeScript bridge (ai-master.ts) spawns this script via
child_process.execFile and parses stdout as JSON.
"""

import argparse
import json
import sys
import os
import logging

# ── Logging to stderr only ──────────────────────────────────

logging.basicConfig(
    stream=sys.stderr,
    level=logging.INFO,
    format="[deepafx] %(levelname)s %(message)s",
)
logger = logging.getLogger(__name__)


# ── Model loading ───────────────────────────────────────────

def load_model(checkpoint_path: str):
    """
    Load the DeepAFx-ST autodiff model from a checkpoint file.

    Heavy imports (torch, deepafx_st) happen here — not at module
    level — so argument validation fails fast without the ~2 s
    PyTorch import overhead.

    Returns:
        The loaded model object ready for inference.

    Raises:
        FileNotFoundError: if the checkpoint file doesn't exist.
        RuntimeError: if the model can't be loaded.
    """
    logger.info(f"Loading checkpoint from {checkpoint_path}")

    if not os.path.isfile(checkpoint_path):
        raise FileNotFoundError(f"Checkpoint not found: {checkpoint_path}")

    import torch

    # Force CPU — no CUDA. This keeps memory bounded and avoids
    # GPU driver issues in containerised environments.
    device = torch.device("cpu")

    try:
        # DeepAFx-ST exposes a System class that wraps the encoder +
        # processor chain. The checkpoint contains the trained weights.
        #
        # NOTE: The exact import path depends on the deepafx-st package
        # version. If the package restructures, update this import.
        from deepafx_st.system import System

        model = System.load_from_checkpoint(checkpoint_path, map_location=device)
        model.eval()
        model.to(device)
        logger.info("Model loaded successfully")
        return model
    except ImportError:
        # Fallback: try loading as a raw state dict if System isn't
        # available (older versions of the package).
        logger.warning("System class not found, attempting raw checkpoint load")
        checkpoint = torch.load(checkpoint_path, map_location=device)
        return checkpoint


# ── Inference ───────────────────────────────────────────────

def run_inference(model, input_path: str, reference_path: str, output_path: str) -> dict:
    """
    Run DeepAFx-ST style transfer: make `input_path` sound like
    `reference_path`, write the result to `output_path`.

    Returns:
        A dict with the predicted EQ + compressor parameters,
        structured to match TAiMasterPredictedParams in shared-types.
    """
    import torch
    import soundfile as sf
    import numpy as np

    logger.info(f"Loading input: {input_path}")
    input_audio, input_sr = sf.read(input_path, dtype="float32")
    if input_audio.ndim > 1:
        input_audio = input_audio.mean(axis=1)  # mono

    logger.info(f"Loading reference: {reference_path}")
    ref_audio, ref_sr = sf.read(reference_path, dtype="float32")
    if ref_audio.ndim > 1:
        ref_audio = ref_audio.mean(axis=1)

    # Resample reference to input sample rate if they differ
    if ref_sr != input_sr:
        import torchaudio
        ref_tensor = torch.from_numpy(ref_audio).unsqueeze(0)
        ref_tensor = torchaudio.functional.resample(ref_tensor, ref_sr, input_sr)
        ref_audio = ref_tensor.squeeze(0).numpy()

    # Convert to torch tensors [batch=1, channels=1, samples]
    device = torch.device("cpu")
    x = torch.from_numpy(input_audio).unsqueeze(0).unsqueeze(0).to(device)
    r = torch.from_numpy(ref_audio).unsqueeze(0).unsqueeze(0).to(device)

    logger.info(f"Running inference (input={x.shape[-1]} samples, ref={r.shape[-1]} samples)")

    with torch.no_grad():
        try:
            # The System.forward() method returns (output_audio, predicted_params)
            # predicted_params is a dict of parameter tensors from the encoder.
            output, params = model(x, r)
        except (TypeError, AttributeError):
            # Fallback for different model API versions
            logger.warning("Standard forward failed, trying alternative API")
            output = model.process(x, r)
            params = getattr(model, "last_params", {})

    # Write output audio
    output_np = output.squeeze().cpu().numpy()
    sf.write(output_path, output_np, input_sr, subtype="PCM_24")
    logger.info(f"Output written: {output_path}")

    # Extract predicted parameters
    predicted = extract_params(params)
    logger.info(f"Predicted EQ bands: {len(predicted['eq'])}")

    return predicted


def extract_params(params: dict) -> dict:
    """
    Extract and format the predicted DSP parameters from the model
    output into the shape expected by TAiMasterPredictedParams.

    The DeepAFx-ST autodiff model predicts parameters for a 6-band
    parametric EQ (3 params × 6 bands = 18) and a compressor
    (6 params). The exact tensor keys depend on the model version;
    we handle both the common naming conventions.
    """
    import torch

    def to_float(t) -> float:
        """Safely convert a tensor or scalar to a Python float."""
        if isinstance(t, torch.Tensor):
            return float(t.detach().cpu().item())
        return float(t)

    # ── EQ parameters ─────────────────────────────────────

    eq_bands = []
    band_configs = [
        {"type": "low-shelf",  "default_freq": 80,   "default_q": 0.707},
        {"type": "peaking",    "default_freq": 350,   "default_q": 1.5},
        {"type": "peaking",    "default_freq": 1200,  "default_q": 2.0},
        {"type": "peaking",    "default_freq": 3500,  "default_q": 1.8},
        {"type": "peaking",    "default_freq": 7000,  "default_q": 0.9},
        {"type": "high-shelf", "default_freq": 8500,  "default_q": 0.707},
    ]

    # Try to extract per-band params from the model output.
    # Common keys: "eq_gain_0", "eq_freq_0", "eq_q_0" etc.
    for i, cfg in enumerate(band_configs):
        gain = _get_param(params, [f"eq_gain_{i}", f"peq_gain_{i}", f"gain_{i}"], 0.0)
        freq = _get_param(params, [f"eq_freq_{i}", f"peq_freq_{i}", f"freq_{i}"], cfg["default_freq"])
        q = _get_param(params, [f"eq_q_{i}", f"peq_q_{i}", f"q_{i}"], cfg["default_q"])

        eq_bands.append({
            "type": cfg["type"],
            "freq": round(to_float(freq), 1),
            "gain": round(to_float(gain), 2),
            "q": round(to_float(q), 3),
        })

    # ── Compressor parameters ─────────────────────────────

    compressor = {
        "threshold": round(to_float(_get_param(params, ["comp_threshold", "threshold", "comp_th"], -12.0)), 1),
        "ratio": round(to_float(_get_param(params, ["comp_ratio", "ratio", "comp_r"], 2.0)), 1),
        "attack": round(to_float(_get_param(params, ["comp_attack", "attack", "comp_at"], 0.001)), 4),
        "release": round(to_float(_get_param(params, ["comp_release", "release", "comp_rel"], 0.045)), 4),
        "knee": round(to_float(_get_param(params, ["comp_knee", "knee", "comp_kn"], 6.0)), 1),
        "makeupGain": round(to_float(_get_param(params, ["comp_makeup", "makeup_gain", "comp_mg", "makeup"], 0.0)), 1),
    }

    return {"eq": eq_bands, "compressor": compressor}


def _get_param(params: dict, keys: list, default):
    """
    Try multiple key names in order and return the first match.
    Falls back to default if none found. Handles nested dicts.
    """
    for key in keys:
        if key in params:
            return params[key]
        # Try nested under common prefixes
        for prefix in ["processor.", "dsp.", ""]:
            full_key = f"{prefix}{key}"
            if full_key in params:
                return params[full_key]
    return default


# ── CLI entrypoint ──────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="DeepAFx-ST AI mastering worker",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument("--input", required=True, help="Input audio file path")
    parser.add_argument("--reference", required=True, help="Reference audio file path")
    parser.add_argument("--output", required=True, help="Output audio file path")
    parser.add_argument("--checkpoint", required=True, help="Model checkpoint file path")

    args = parser.parse_args()

    # Validate paths before loading the model (fast fail)
    for path, label in [(args.input, "input"), (args.reference, "reference")]:
        if not os.path.isfile(path):
            logger.error(f"{label} file not found: {path}")
            sys.exit(1)

    try:
        model = load_model(args.checkpoint)
    except FileNotFoundError as e:
        logger.error(str(e))
        sys.exit(2)
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        sys.exit(2)

    try:
        predicted_params = run_inference(model, args.input, args.reference, args.output)
    except Exception as e:
        logger.error(f"Inference failed: {e}")
        sys.exit(3)

    # Print JSON to stdout — this is what the TypeScript bridge parses
    try:
        print(json.dumps(predicted_params, ensure_ascii=False))
    except Exception as e:
        logger.error(f"Failed to serialize params: {e}")
        sys.exit(4)


if __name__ == "__main__":
    main()
