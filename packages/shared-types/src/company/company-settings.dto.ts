import { z } from 'zod';


// ─── Org Layers ───────────────────────────────────────────

/** Body for PATCH /:id/settings/org-layers */
export const SOrgLayers = z.object({
  orgLayers: z.array(z.string().min(1)).min(1),
});
export type TOrgLayers = z.infer<typeof SOrgLayers>;
