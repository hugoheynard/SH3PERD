import type { ArtistPerformanceSlotTemplate } from '../program-types';

export const mockPerformanceSlotsTemplates: ArtistPerformanceSlotTemplate[] = [
  { id: 't1', name: 'PBO', duration: 15, type: 'performance', color: '#73098c', playlist: true, song: false, technicianRequired: false },
  { id: 't2', name: 'Cabaret', duration: 15, type: 'performance', color: '#f19010', playlist: true, song: false, technicianRequired: false },
  { id: 't3', name: 'Aerial', duration: 5, type: 'performance', color: '#66eda1', playlist: false, song: true, technicianRequired: true },
  { id: 't4', name: 'Club', duration: 15, type: 'performance', color: '#66b9ed', playlist: false, song: false, technicianRequired: false},
  { id: 't5', name: 'FINAL', duration: 5, type: 'performance', color: '#66ceed', playlist: false, song: true, technicianRequired: false }
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
    staff: [
      ...mockArtists_dancers
    ] },
]

export const mockBuffers = [
  {
    id: 'buffer-1',
    roomId: 'r1',
    atMinutes: 60,
    delta: 15
  },
  {
    id: 'buffer-2',
    roomId: 'r1',
    atMinutes: 120,
    delta: 5
  }
];
