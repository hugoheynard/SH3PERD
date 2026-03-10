export interface PlanningSlotTemplate {
  id: string;
  name: string;
  duration: number;
  type: string;
  color: string;
}

/**
 * A performance template is a planning slot template with additional properties that are used to determine how the performance should be scheduled and displayed in the program.
 * - playlist: indicates whether the performance is a playlist or not. If true, the performance will be scheduled as a playlist and will be displayed with a playlist icon in the program.
 * - singleTrack: indicates whether the performance is a single track or not. If true, the performance will be scheduled as a single track and will be displayed with a single track icon in the program.
 */
export interface ArtistPerformanceSlotTemplate extends PlanningSlotTemplate {
  playlist: boolean;
  song: boolean;
  technicianRequired: boolean;
}


export interface PlanningSlot {
  id: string;
  startMinutes: number;
  duration: number;
  type: string;
  color: string;
  roomId: string;
}


export interface ArtistPerformanceSlot extends PlanningSlot {
  artists: Artist[];
  loadScore?: number;
  playlist: boolean;
  song: boolean;
  playlist_details?: {
    id: string;
    name: string;
    songList: string[];
  };
  song_details?: {
    id: string;
    name: string;
  };
}

export interface Room {
  id: string;
  name: string;
}

export interface ProgramState {
  name: string;
  startTime: string;
  endTime: string;
  rooms: Room[];
  slots: ArtistPerformanceSlot[];
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  roleColor: string;
}


export interface ArtistGroup {
  id: string;
  name: string;
  artists: Artist[];
  color?: string;
}
