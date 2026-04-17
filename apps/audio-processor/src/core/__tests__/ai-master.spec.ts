import type { TAiMasterPredictedParams } from '@sh3pherd/shared-types';

// ── Mocks (must be set up before importing the module under test) ──

// Mock master.ts to avoid ffmpeg dependency
jest.mock('../master', () => ({
  masterAudio: jest.fn().mockResolvedValue({
    processedBuffer: Buffer.from('loudnormed'),
    report: 'loudnorm report',
  }),
}));

// Mock fs
jest.mock('node:fs/promises', () => ({
  writeFile: jest.fn().mockResolvedValue(undefined),
  readFile: jest.fn().mockResolvedValue(Buffer.from('processed-audio')),
  unlink: jest.fn().mockResolvedValue(undefined),
}));

const FAKE_PREDICTED_PARAMS: TAiMasterPredictedParams = {
  eq: [
    { type: 'low-shelf', freq: 80, gain: 2.4, q: 0.707 },
    { type: 'peaking', freq: 350, gain: -1.2, q: 1.5 },
    { type: 'peaking', freq: 1200, gain: 0.8, q: 2.0 },
    { type: 'peaking', freq: 3500, gain: 1.6, q: 1.8 },
    { type: 'peaking', freq: 7000, gain: -0.5, q: 0.9 },
    { type: 'high-shelf', freq: 8500, gain: 3.1, q: 0.707 },
  ],
  compressor: {
    threshold: -18.5,
    ratio: 3.2,
    attack: 0.012,
    release: 0.15,
    knee: 6.0,
    makeupGain: 4.2,
  },
};

// Mock promisify so that when ai-master.ts does promisify(execFile),
// it gets our controlled mock function instead of the real subprocess.
// The @types/jest signature is `fn<TReturn, TArgs>`, so the function type is
// split between the two generics rather than expressed as a single arrow.
const mockExec = jest.fn<
  Promise<{ stdout: string; stderr: string }>,
  [file: string, args: readonly string[]]
>();
jest.mock('node:util', () => ({
  ...jest.requireActual<typeof import('node:util')>('node:util'),
  promisify: jest.fn(() => mockExec),
}));

// ── Imports (after all mocks are registered) ──

import * as fs from 'node:fs/promises';
import { aiMasterAudio } from '../ai-master';
import { masterAudio } from '../master';

const mockWriteFile = fs.writeFile as jest.Mock;
const mockReadFile = fs.readFile as jest.Mock;
const mockUnlink = fs.unlink as jest.Mock;
const mockMasterAudio = masterAudio as jest.Mock;

// ── Setup ──

beforeEach(() => {
  jest.clearAllMocks();
  mockWriteFile.mockResolvedValue(undefined);
  mockReadFile.mockResolvedValue(Buffer.from('processed-audio'));
  mockUnlink.mockResolvedValue(undefined);
  mockExec.mockResolvedValue({
    stdout: JSON.stringify(FAKE_PREDICTED_PARAMS),
    stderr: '[deepafx] INFO done\n',
  });
  mockMasterAudio.mockResolvedValue({
    processedBuffer: Buffer.from('loudnormed'),
    report: 'loudnorm report',
  });
});

// ── Tests ──

describe('aiMasterAudio', () => {
  const inputBuf = Buffer.from('input-audio');
  const refBuf = Buffer.from('reference-audio');
  const ckpt = '/path/to/checkpoint.ckpt';

  it('writes input and reference to temp files', async () => {
    await aiMasterAudio(inputBuf, refBuf, ckpt);
    expect(mockWriteFile).toHaveBeenCalledTimes(2);
  });

  it('returns predicted params from the Python subprocess', async () => {
    const result = await aiMasterAudio(inputBuf, refBuf, ckpt);
    expect(result.predictedParams).toEqual(FAKE_PREDICTED_PARAMS);
  });

  it('returns processedBuffer from the DeepAFx output file', async () => {
    const result = await aiMasterAudio(inputBuf, refBuf, ckpt);
    expect(result.processedBuffer).toEqual(Buffer.from('processed-audio'));
  });

  it('skips loudnorm when no target is provided', async () => {
    const result = await aiMasterAudio(inputBuf, refBuf, ckpt);
    expect(mockMasterAudio).not.toHaveBeenCalled();
    expect(result.loudnormReport).toBeUndefined();
  });

  it('runs loudnorm as stage 2 when target is provided', async () => {
    const target = { targetLUFS: -14, targetTP: -1, targetLRA: 7 };
    const result = await aiMasterAudio(inputBuf, refBuf, ckpt, target);

    expect(mockMasterAudio).toHaveBeenCalledTimes(1);
    expect(result.processedBuffer).toEqual(Buffer.from('loudnormed'));
    expect(result.loudnormReport).toBe('loudnorm report');
  });

  it('cleans up 3 temp files on success', async () => {
    await aiMasterAudio(inputBuf, refBuf, ckpt);
    expect(mockUnlink).toHaveBeenCalledTimes(3);
  });

  it('cleans up temp files on python subprocess failure', async () => {
    mockExec.mockRejectedValueOnce(new Error('python crashed'));
    await expect(aiMasterAudio(inputBuf, refBuf, ckpt)).rejects.toThrow(
      'python crashed',
    );
    expect(mockUnlink).toHaveBeenCalledTimes(3);
  });

  it('throws when python stdout is not valid JSON', async () => {
    mockExec.mockResolvedValueOnce({ stdout: 'not-json!!!', stderr: '' });
    await expect(aiMasterAudio(inputBuf, refBuf, ckpt)).rejects.toThrow(
      'Failed to parse',
    );
  });

  it('spawns python3 with correct args', async () => {
    await aiMasterAudio(inputBuf, refBuf, ckpt);
    expect(mockExec).toHaveBeenCalledTimes(1);
    // Destructure to keep the typed signature of mockExec instead of indexing
    // an `any` tuple.
    const [file, cliArgs] = mockExec.mock.calls[0];
    expect(file).toBe('python3');
    expect(cliArgs).toContain('--input');
    expect(cliArgs).toContain('--reference');
    expect(cliArgs).toContain('--output');
    expect(cliArgs).toContain('--checkpoint');
  });
});
