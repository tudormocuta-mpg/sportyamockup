export type MatchStatus = 'scheduled' | 'in-progress' | 'completed' | 'walkover' | 'postponed'
export type DrawFormat = 'singles' | 'doubles'
export type DrawType = 'knockout' | 'group+knockout'
export type ScheduleStatus = 'private' | 'public'
export type BlockerType = 'schedule-conflict' | 'rest-violation' | 'availability-conflict' | 'court-conflict' | 'dependency'

export interface Player {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  sportyaLevelSingles: number
  sportyaLevelDoubles: number
  joinedDate: Date
  availability: {
    [day: string]: ('morning' | 'daytime' | 'evening')[]
  }
}

export interface DoublesTeam {
  id: string
  player1Id: string
  player2Id: string
  teamName?: string
}

export interface Court {
  id: string
  name: string
  surface: 'hard' | 'clay' | 'grass' | 'indoor'
  indoor: boolean
  lighting: boolean
  isFinalsCourt?: boolean
  availability: {
    date: string
    startTime: string
    endTime: string
    blocked?: boolean
    reason?: string
  }[]
}

export interface Match {
  id: string
  matchNumber?: number
  drawId: string
  drawName: string
  format: DrawFormat
  round: string
  player1Id: string
  player2Id: string
  player1Name?: string
  player2Name?: string
  courtId?: string
  courtName?: string
  scheduledDate?: string
  scheduledTime?: string
  actualStartTime?: string
  actualEndTime?: string
  duration?: number
  status: MatchStatus
  score?: string
  winner?: string
  notes?: string
  dependencies?: string[]
  seedingInfo?: {
    player1Seed?: number
    player2Seed?: number
  }
}

export interface Draw {
  id: string
  name: string
  format: DrawFormat
  type: DrawType
  numberOfPlayers: number
  rounds: string[]
  matches: Match[]
  preferences?: {
    preferredCourts?: string[]
    preferredTimeSlots?: string[]
    maxMatchesPerDay?: number
  }
}

export interface SchedulingConfig {
  defaultMatchDuration: number
  bufferTimeBetweenMatches: number
  minimumRestPeriod: number
  dailyStartTime: string
  dailyEndTime: string
  preferredFinalsCourts: string[]
  indoorCourtUtilization: 'always' | 'weather-dependent' | 'finals-only' | 'never'
  maxMatchesPerPlayerPerDay: number
  constraintPriority: string[]
}

export interface Blocker {
  id: string
  type: BlockerType
  severity: 'critical' | 'warning' | 'info'
  description: string
  affectedMatches: string[]
  affectedDraws?: string[]
  suggestedResolution?: string
  isResolved: boolean
  createdAt: Date
}

export interface ScheduleOption {
  id: string
  name: string
  description: string
  duration: number
  matchCount: number
  courtUtilization: number
  playerSatisfaction: number
  qualityScore: number
  conflicts: number
  tradeoffs: string[]
  schedule: Match[]
}

export interface TournamentState {
  name: string
  startDate: string
  endDate: string
  players: Player[]
  doublesTeams: DoublesTeam[]
  courts: Court[]
  draws: Draw[]
  matches: Match[]
  config: SchedulingConfig
  blockers: Blocker[]
  scheduleStatus: ScheduleStatus
  selectedScheduleOption?: ScheduleOption
  generatedOptions: ScheduleOption[]
  lastModified: Date
  lastPublished?: Date
}

export interface NotificationTemplate {
  id: string
  name: string
  type: 'match-scheduled' | 'schedule-change' | 'daily-reminder' | 'tournament-start'
  subject: string
  message: string
  channels: ('email' | 'sms' | 'whatsapp' | 'push')[]
  enabled: boolean
}

export interface PlayerAvailability {
  playerId: string
  date: string
  periods: ('morning' | 'daytime' | 'evening')[]
  blockedSlots?: {
    startTime: string
    endTime: string
    reason?: string
  }[]
}

export interface RescheduleRequest {
  matchId: string
  newCourtId?: string
  newDate?: string
  newTime?: string
  reason?: string
}