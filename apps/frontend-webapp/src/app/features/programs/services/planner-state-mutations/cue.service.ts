import { inject, Injectable } from '@angular/core';
import { ProgramHistoryService } from '../program-history.service';
import type { TimelineCue } from '../../program-types';

@Injectable({
  providedIn: 'root'
})
export class CueService {
  private history = inject(ProgramHistoryService);

  /* ------------------ CREATE ------------------ */

  addCue(cue: TimelineCue) {
    this.history.updateState(state => ({
      ...state,
      cues: [...state.cues, cue]
    }));
  }

  /* ------------------ UPDATE ------------------ */

  updateCue(id: string, patch: Partial<TimelineCue>) {
    this.history.updateState(state => ({
      ...state,
      cues: state.cues.map(c =>
        c.id === id ? { ...c, ...patch } : c
      )
    }));
  }

  /* ------------------ DELETE ------------------ */

  removeCue(id: string) {
    this.history.updateState(state => ({
      ...state,
      cues: state.cues.filter(c => c.id !== id)
    }));
  }
}
