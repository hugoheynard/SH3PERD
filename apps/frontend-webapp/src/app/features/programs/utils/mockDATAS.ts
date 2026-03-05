import type { PerformanceTemplate } from '../services/program-state.service';

export const mockPerformanceSlotsTemplates: PerformanceTemplate[] = [
  { id: 't1', name: 'PBO', duration: 15, type: 'PBO', color: '#d066ed',  },
  { id: 't2', name: 'Cabaret', duration: 15, type: 'CABARET', color: '#f19010' },
  { id: 't3', name: 'Aerial', duration: 5, type: 'AERIAL', color: '#66eda1' },
  { id: 't4', name: 'Club', duration: 15, type: 'CLUB_ROTATION', color: '#66b9ed' },
  { id: 't5', name: 'FINAL', duration: 5, type: 'FINAL', color: '#66ceed' }
];


export const mockArtists_external = [
  { id: 'a1', name: 'Jesse' },
  { id: 'a2', name: 'Lydia' },
  { id: 'a3', name: 'LLeroy' },
]

export const mockArtists_dancers = [
  { id: 'd1', name: 'Moku' },
  { id: 'd2', name: 'Max' },
  { id: 'd3', name: 'Isia' },
  { id: 'd4', name: 'Tida' },
]

export const mockUserGroups = [
  { id: 'g1', name: 'All artists', artists: [
      ...mockArtists_external,
      ...mockArtists_dancers
    ] },
]
