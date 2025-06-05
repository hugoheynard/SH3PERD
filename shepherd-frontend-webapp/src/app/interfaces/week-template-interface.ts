export interface ShowDetail {
  playlist: string;
  startTime: string;
}

export interface CabaretSettings {
  hasCabaret: boolean;
  numberOfShows: number;
  showsDetails: ShowDetail[];
}

export interface DaySettings {
  dayIndex: number;
  cabaretSettings: CabaretSettings;
  clubbingHours: ClubbingHours;
  weeklyEvents: WeeklyEvents;
}

export interface ClubbingHours {
  start: string;
  end: string;
}

export interface WeeklyEvents {
  hasWeeklyEvent: boolean;
  selectedWeeklyEvent: string;
}

export interface WeekTemplate {
  days: DaySettings[];
}
