import type { PerformanceTemplate } from '../program-state.service';

export const mockPerformanceSlotsTemplates: PerformanceTemplate[] = [
  { id: 't1', name: 'PBO', duration: 15, type: 'PBO', color: '#d066ed' },
  { id: 't2', name: 'Cabaret', duration: 15, type: 'CABARET', color: '#f19010' },
  { id: 't3', name: 'Aerial', duration: 5, type: 'AERIAL', color: '#66eda1' },
  { id: 't4', name: 'Club', duration: 15, type: 'CLUB_ROTATION', color: '#66b9ed' },
  { id: 't5', name: 'FINAL', duration: 5, type: 'FINAL', color: '#66ceed' }
];
