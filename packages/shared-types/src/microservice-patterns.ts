/**
 * Registry of all TCP microservice message patterns.
 * Single source of truth — used by both the sender (backend) and receiver (microservices).
 */
export const MicroservicePatterns = {
  AudioProcessor: {
    ANALYZE_TRACK:      'analyze_track',
    MASTER_TRACK:       'master_track',
    PITCH_SHIFT_TRACK:  'pitch_shift_track',
  },
} as const;
