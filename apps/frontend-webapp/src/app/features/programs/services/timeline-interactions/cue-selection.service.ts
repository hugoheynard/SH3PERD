import { Injectable} from '@angular/core';
import { BaseSelectionService } from '../timeline-core/BaseSelectionService';


/**
 * Manages selection state for timeline cues.
 *
 * ---------------------------------------------------------------------------
 * 🧠 ROLE
 * ---------------------------------------------------------------------------
 *
 * Stores ONLY cue IDs (source of truth).
 *
 * Objects are derived via selectors (CueSelectorsService).
 *
 * ---------------------------------------------------------------------------
 * ⚠️ IMPORTANT
 * ---------------------------------------------------------------------------
 *
 * - Never store full cue objects (avoid stale references)
 * - Always store IDs
 *
 */
@Injectable({ providedIn: 'root' })
export class CueSelectionService extends BaseSelectionService<string> {}
