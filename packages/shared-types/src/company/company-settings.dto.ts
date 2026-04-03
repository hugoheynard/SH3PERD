import { z } from 'zod';
import { SCommunicationPlatform } from './communication.types.js';


// ─── Org Layers ───────────────────────────────────────────

/** Body for PATCH /:id/settings/org-layers */
export const SOrgLayers = z.object({
  orgLayers: z.array(z.string().min(1)).min(1),
});
export type TOrgLayers = z.infer<typeof SOrgLayers>;


// ─── Connect Integration ───────────────────────────────────

/** Body for POST /:id/settings/integrations */
export const SConnectIntegrationBody = z.object({
  platform: SCommunicationPlatform,
  config:   z.record(z.string()),
});
export type TConnectIntegrationBody = z.infer<typeof SConnectIntegrationBody>;


// ─── Add Channel ───────────────────────────────────────────

/** Body for POST /:id/settings/channels */
export const SAddChannelBody = z.object({
  name:     z.string().min(1),
  platform: SCommunicationPlatform,
  url:      z.string().url(),
});
export type TAddChannelBody = z.infer<typeof SAddChannelBody>;
