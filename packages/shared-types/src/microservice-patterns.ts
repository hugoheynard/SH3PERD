/**
 * Registry of all TCP microservice message patterns.
 * Single source of truth — used by both the sender (backend) and receiver (microservices).
 */
export const MicroservicePatterns = {
  AudioProcessor: {
    ANALYZE_TRACK: 'analyze_track',
    MASTER_TRACK:  'master_track',
  },
} as const;
