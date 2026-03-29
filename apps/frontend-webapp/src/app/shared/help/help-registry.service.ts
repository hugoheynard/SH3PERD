import { Injectable, signal } from '@angular/core';

export type HelpEntry = {
  id: string;
  label: string;
  description: string;
  /** Optional grouping key (e.g. 'music-library', 'profile'). */
  group?: string;
};

/**
 * Central registry that collects help entries from `[sh3Info]` directives.
 * The help panel reads from this registry to display contextual documentation.
 *
 * Entries are registered/unregistered as directives init/destroy (route-aware).
 */
@Injectable({ providedIn: 'root' })
export class HelpRegistryService {

  private readonly _entries = signal<HelpEntry[]>([]);
  readonly entries = this._entries.asReadonly();

  register(entry: HelpEntry): void {
    this._entries.update(list => {
      // Avoid duplicates
      if (list.some(e => e.id === entry.id)) return list;
      return [...list, entry];
    });
  }

  unregister(id: string): void {
    this._entries.update(list => list.filter(e => e.id !== id));
  }

  /** All entries for a given group. */
  byGroup(group: string): HelpEntry[] {
    return this._entries().filter(e => e.group === group);
  }
}
