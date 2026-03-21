export interface PlanningSlotTemplate {
  id: string;
  name: string;
  duration: number;
  type: SlotType;
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

export type SlotType =
  | 'performance'
  | 'buffer';

export interface PlanningSlot {
  id: string;
  name: string;
  startMinutes: number;
  duration: number;
  type: SlotType;
  color: string;
  roomId: string;
}


export interface ArtistPerformanceSlot extends PlanningSlot {
  artists: PlannerArtist[];
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
  mode: ProgramMode;
  rooms: Room[];
  slots: ArtistPerformanceSlot[];
  artists: PlannerArtist[];
  userGroups: UserGroup[];
  timelineOffsets: TimelineBuffer[];
  cues: TimelineCue[];
}

export interface PlannerArtist {
  id: string;
  name: string;
  role: string;
  roleColor: string;
  sourceUserGroup_id?: string;
}


export interface UserGroup {
  id: string;
  name: string;
  color?: string;
  staff: PlannerArtist[];
}

export type ProgramMode = 'manual' | 'assisted';

/**
 * BUFFER SLOTS
 * A buffer slot represents a time gap in the program schedule that can be used to separate performances or to fill in gaps between performances. Buffer slots are not associated with any artists and are typically displayed as empty slots in the program schedule.
 * The TimelineOffset interface represents a change in the timeline of the program, which can be caused by inserting or removing buffer slots. It contains the following properties:
 * - id: a unique identifier for the timeline offset
 */
export interface TimelineBuffer {
  id: string;
  roomId: string;
  atMinutes: number;
  delta: number;
}

//type UI only, used to render the timeline with both performance slots and buffer slots
export type TimelineBlock =
  | {
  type: "slot"
  id: string
  startMinutes: number
  duration: number
  slot: ArtistPerformanceSlot
}
  | {
  type: "buffer"
  id: string
  startMinutes: number
  duration: number
}

export type TimelineCue = {
  id: string;
  roomId: string;
  atMinutes: number;
  label: string;
  type?: CueType;
};

export enum CueType {
  TECHNICAL = 'technical',
  ARTISTIC = 'artistic',
  LOGISTIC = 'logistic',
  DEFAULT = 'default'
}
