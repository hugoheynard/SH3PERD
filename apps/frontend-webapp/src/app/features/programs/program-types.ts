export interface PerformanceTemplate {
  id: string;
  name: string;
  duration: number;
  type: string;
  color: string;
}

export interface PerformanceSlot {
  id: string;
  startMinutes: number;
  duration: number;
  type: string;
  color: string;
  roomId: string;
  artists: Artist[];
  loadScore?: number;
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
  slots: PerformanceSlot[];
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
