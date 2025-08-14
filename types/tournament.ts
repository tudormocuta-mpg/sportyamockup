// Core tournament entity types
export interface Player {
  id: string
  firstName: string
  lastName: string
  email: string
  sportyaLevelSingles: number
  sportyaLevelDoubles: number
  joinedDate: Date
  profilePicture?: string
  phone?: string
  notes?: string
}

export interface Court {
  id: string
  name: string
  surface: 'hard' | 'clay' | 'grass' | 'carpet'
  indoor: boolean
  lighting: boolean
  isFinalsCourt?: boolean
  capacity?: number
  bookingPriority?: number
}

export type MatchStatus = 'scheduled' | 'in-progress' | 'completed' | 'walkover' | 'postponed'

export interface Match {
  id: string
  drawId: string
  drawName: string
  roundName: string
  player1Id?: string
  player1Name?: string
  player2Id?: string
  player2Name?: string
  courtId?: string
  courtName?: string
  scheduledDate?: string
  scheduledTime?: string
  status: MatchStatus
  score?: string
  duration?: number
  estimatedDuration?: number
  isDoubles?: boolean
  walkoverReason?: string
  notes?: string
  priority?: 'high' | 'medium' | 'low'
  createdAt: Date
  updatedAt: Date
}

export interface Blocker {
  id: string
  courtId: string
  courtName: string
  date: string
  startTime: string
  endTime: string
  title: string
  description?: string
  type: 'maintenance' | 'reserved' | 'unavailable' | 'other'
  isRecurring?: boolean
  recurringPattern?: 'daily' | 'weekly' | 'monthly'
  createdBy?: string
  createdAt: Date
}

export interface TournamentDraw {
  id: string
  name: string
  format: 'single-elimination' | 'double-elimination' | 'round-robin'
  category: 'mens-singles' | 'womens-singles' | 'mens-doubles' | 'womens-doubles' | 'mixed-doubles'
  maxPlayers: number
  currentPlayers: number
  entryDeadline?: Date
  startDate?: Date
  endDate?: Date
  status: 'open' | 'closed' | 'in-progress' | 'completed'
  prizeMoney?: number
  entryCost?: number
}

export interface TimeSlot {
  time: string
  courtId: string
  match?: Match
  blocker?: Blocker
  available: boolean
}

export interface ScheduleConflict {
  id: string
  type: 'player-double-booking' | 'court-unavailable' | 'time-overlap' | 'duration-exceeded'
  severity: 'error' | 'warning' | 'info'
  matchId?: string
  playerId?: string
  courtId?: string
  message: string
  suggestedResolution?: string
}

// View and UI related types
export type ViewMode = 'grid' | 'list' | 'timeline'

export interface GridViewProps {
  matches: Match[]
  courts: Court[]
  blockers: Blocker[]
  timeSlots: string[]
  onMatchMove: (matchId: string, courtId: string, timeSlot: string) => void
  onMatchClick: (match: Match) => void
}

export interface ListViewProps {
  matches: Match[]
  courts: Court[]
  players: Player[]
  onMatchUpdate: (matchId: string, updates: Partial<Match>) => void
  onBulkUpdate: (matchIds: string[], updates: Partial<Match>) => void
}

export interface TimelineViewProps {
  matches: Match[]
  courts: Court[]
  blockers: Blocker[]
  startHour?: number
  endHour?: number
  intervalMinutes?: number
  onMatchMove: (matchId: string, courtId: string, startTime: string) => void
}

// Context and state management types
export interface TournamentState {
  players: Player[]
  courts: Court[]
  matches: Match[]
  blockers: Blocker[]
  draws: TournamentDraw[]
  selectedMatch: Match | null
  conflicts: ScheduleConflict[]
  currentView: ViewMode
  selectedDate: string
  loading: boolean
  error: string | null
}

export interface TournamentContextType {
  state: TournamentState
  dispatch: React.Dispatch<TournamentAction>
  // Action creators
  setSelectedMatch: (match: Match | null) => void
  setCurrentView: (view: ViewMode) => void
  setSelectedDate: (date: string) => void
  updateMatch: (matchId: string, updates: Partial<Match>) => void
  updateMatchStatus: (matchId: string, status: MatchStatus) => void
  moveMatch: (matchId: string, courtId: string, timeSlot: string) => void
  addBlocker: (blocker: Omit<Blocker, 'id' | 'createdAt'>) => void
  removeBlocker: (blockerId: string) => void
  checkConflicts: () => void
  clearConflicts: () => void
}

// Action types for reducer
export type TournamentAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SELECTED_MATCH'; payload: Match | null }
  | { type: 'SET_CURRENT_VIEW'; payload: ViewMode }
  | { type: 'SET_SELECTED_DATE'; payload: string }
  | { type: 'UPDATE_MATCH'; payload: { matchId: string; updates: Partial<Match> } }
  | { type: 'MOVE_MATCH'; payload: { matchId: string; courtId: string; timeSlot: string } }
  | { type: 'ADD_BLOCKER'; payload: Blocker }
  | { type: 'REMOVE_BLOCKER'; payload: string }
  | { type: 'SET_CONFLICTS'; payload: ScheduleConflict[] }
  | { type: 'CLEAR_CONFLICTS' }

// Configuration types
export interface TournamentConfiguration {
  defaultMatchDuration: number
  allowOverlappingMatches: boolean
  courtChangePenalty: number
  maxMatchesPerPlayer: number
  restTimeBetweenMatches: number
  priorityCourtBooking: boolean
  autoScheduleEnabled: boolean
  conflictResolutionMode: 'strict' | 'flexible'
}

// Export and scheduling types
export interface ScheduleExport {
  format: 'pdf' | 'excel' | 'ical' | 'json'
  includePlayerDetails: boolean
  includeCourtInfo: boolean
  dateRange?: {
    startDate: string
    endDate: string
  }
  courtIds?: string[]
  drawIds?: string[]
}

export interface SchedulingConstraints {
  availableHours: {
    startTime: string
    endTime: string
  }
  breakDuration: number
  maxConsecutiveMatches: number
  courtPreferences: Record<string, string[]> // playerId -> courtIds
  playerAvailability: Record<string, { date: string; startTime: string; endTime: string }[]>
}