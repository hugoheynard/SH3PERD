import type { PerformanceTemplate } from '../program-types';

export const mockPerformanceSlotsTemplates: PerformanceTemplate[] = [
  { id: 't1', name: 'PBO', duration: 15, type: 'PBO', color: '#73098c',  },
  { id: 't2', name: 'Cabaret', duration: 15, type: 'CABARET', color: '#f19010' },
  { id: 't3', name: 'Aerial', duration: 5, type: 'AERIAL', color: '#66eda1' },
  { id: 't4', name: 'Club', duration: 15, type: 'CLUB_ROTATION', color: '#66b9ed' },
  { id: 't5', name: 'FINAL', duration: 5, type: 'FINAL', color: '#66ceed' }
];


export const mockArtists_singers = [
  { id: 'a1', name: 'Jesse', role: 'singer', roleColor: '#c66aec' },
  { id: 'a2', name: 'Lydia', role: 'singer', roleColor: '#c66aec' },
  { id: 'a3', name: 'LLeroy', role: 'singer', roleColor: '#c66aec' },
  { id: 'a4', name: 'Liltiss', role: 'singer', roleColor: '#c66aec' },
  { id: 'a5', name: 'Anthea', role: 'singer', roleColor: '#c66aec' },
]

export const mockArtists_dancers = [
  { id: 'd1', name: 'Moku', role: 'dancer', roleColor: '#f19010' },
  { id: 'd2', name: 'Max', role: 'dancer', roleColor: '#f19010' },
  { id: 'd3', name: 'Isia', role: 'dancer', roleColor: '#f19010' },
  { id: 'd4', name: 'Tida', role: 'dancer', roleColor: '#f19010' },
]

export const AllMockArtists = [
  ...mockArtists_singers,
  ...mockArtists_dancers
]

export const mockArtistGroups = [
  {
    id: 'g1',
    name: 'All Dancers',
    artists: [
      ...mockArtists_dancers
    ] },
]
