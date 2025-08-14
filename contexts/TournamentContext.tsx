import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { 
  TournamentState, 
  TournamentContextType, 
  TournamentAction, 
  Match, 
  Player, 
  Court, 
  Blocker, 
  TournamentDraw, 
  ViewMode, 
  MatchStatus,
  ScheduleConflict 
} from '../types/tournament'

// Generate fully scheduled matches (for after wizard completion)
// Respecting court availability: Court 3 (unavailable until 14:00), Court 6 (unavailable 12:00-16:00)
const generateScheduledMatches = (): Match[] => [
  { id: 'm1', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'First Round', player1Id: 'p1', player1Name: 'John Smith', player2Id: 'p3', player2Name: 'Michael Brown', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-08-15', scheduledTime: '09:00', status: 'scheduled', estimatedDuration: 90, priority: 'high', result: '', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm2', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'First Round', player1Id: 'p5', player1Name: 'David Wilson', player2Id: 'p7', player2Name: 'James Taylor', courtId: 'c2', courtName: 'Court 2', scheduledDate: '2024-08-15', scheduledTime: '09:00', status: 'scheduled', estimatedDuration: 90, priority: 'medium', result: '', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm3', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'First Round', player1Id: 'p9', player1Name: 'Robert Thomas', player2Id: 'p11', player2Name: 'Daniel Garcia', courtId: 'c3', courtName: 'Court 3', scheduledDate: '2024-08-15', scheduledTime: '14:00', status: 'in-progress', estimatedDuration: 90, priority: 'high', result: '6-4, 3-2', createdAt: new Date(), updatedAt: new Date() }, // Moved to 14:00 due to court availability
  { id: 'm4', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'First Round', player1Id: 'p13', player1Name: 'Christopher Lee', player2Id: 'p15', player2Name: 'Kevin Harris', courtId: 'c4', courtName: 'Indoor Court A', scheduledDate: '2024-08-15', scheduledTime: '10:30', status: 'scheduled', estimatedDuration: 90, priority: 'medium', result: '', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm5', drawId: 'd2', drawName: 'Women\'s Singles', roundName: 'First Round', player1Id: 'p2', player1Name: 'Emma Johnson', player2Id: 'p4', player2Name: 'Sarah Davis', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-08-15', scheduledTime: '11:00', status: 'scheduled', estimatedDuration: 90, priority: 'high', result: '', createdAt: new Date(), updatedAt: new Date() }, // Adjusted to avoid overlap
  { id: 'm6', drawId: 'd2', drawName: 'Women\'s Singles', roundName: 'First Round', player1Id: 'p6', player1Name: 'Lisa Miller', player2Id: 'p8', player2Name: 'Amanda Anderson', courtId: 'c2', courtName: 'Court 2', scheduledDate: '2024-08-15', scheduledTime: '11:00', status: 'scheduled', estimatedDuration: 90, priority: 'medium', result: '', createdAt: new Date(), updatedAt: new Date() }, // Adjusted to avoid overlap
  { id: 'm7', drawId: 'd2', drawName: 'Women\'s Singles', roundName: 'First Round', player1Id: 'p10', player1Name: 'Jessica Martinez', player2Id: 'p12', player2Name: 'Ashley Rodriguez', courtId: 'c5', courtName: 'Indoor Court B', scheduledDate: '2024-08-15', scheduledTime: '13:00', status: 'completed', score: '6-4, 6-2', result: '6-4, 6-2', estimatedDuration: 90, priority: 'medium', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm8', drawId: 'd2', drawName: 'Women\'s Singles', roundName: 'First Round', player1Id: 'p14', player1Name: 'Megan White', player2Id: 'p16', player2Name: 'Rachel Clark', courtId: 'c6', courtName: 'Practice Court', scheduledDate: '2024-08-15', scheduledTime: '16:30', status: 'scheduled', estimatedDuration: 90, priority: 'low', result: '', createdAt: new Date(), updatedAt: new Date() }, // Moved to 16:30 due to court availability
  { id: 'm9', drawId: 'd3', drawName: 'Men\'s Doubles', roundName: 'Quarterfinals', player1Name: 'Smith/Brown', player2Name: 'Wilson/Taylor', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-08-15', scheduledTime: '15:00', status: 'scheduled', isDoubles: true, estimatedDuration: 120, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm10', drawId: 'd3', drawName: 'Men\'s Doubles', roundName: 'Quarterfinals', player1Name: 'Thomas/Garcia', player2Name: 'Lee/Harris', courtId: 'c2', courtName: 'Court 2', scheduledDate: '2024-08-15', scheduledTime: '15:00', status: 'scheduled', isDoubles: true, estimatedDuration: 120, priority: 'medium', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm11', drawId: 'd4', drawName: 'Women\'s Doubles', roundName: 'Semifinals', player1Name: 'Johnson/Davis', player2Name: 'Miller/Anderson', courtId: 'c3', courtName: 'Court 3', scheduledDate: '2024-08-16', scheduledTime: '09:00', status: 'scheduled', isDoubles: true, estimatedDuration: 120, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm12', drawId: 'd4', drawName: 'Women\'s Doubles', roundName: 'Semifinals', player1Name: 'Martinez/Rodriguez', player2Name: 'White/Clark', courtId: 'c4', courtName: 'Indoor Court A', scheduledDate: '2024-08-16', scheduledTime: '09:00', status: 'scheduled', isDoubles: true, estimatedDuration: 120, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm13', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'Quarterfinals', scheduledDate: '2024-08-16', scheduledTime: '11:00', status: 'scheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm14', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'Quarterfinals', scheduledDate: '2024-08-16', scheduledTime: '11:00', status: 'scheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm15', drawId: 'd2', drawName: 'Women\'s Singles', roundName: 'Quarterfinals', scheduledDate: '2024-08-16', scheduledTime: '13:00', status: 'scheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm16', drawId: 'd2', drawName: 'Women\'s Singles', roundName: 'Quarterfinals', scheduledDate: '2024-08-16', scheduledTime: '13:00', status: 'scheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm17', drawId: 'd5', drawName: 'Mixed Doubles', roundName: 'Final', scheduledDate: '2024-08-17', scheduledTime: '14:00', status: 'scheduled', isDoubles: true, courtId: 'c1', courtName: 'Center Court', estimatedDuration: 120, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm18', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'Semifinals', scheduledDate: '2024-08-17', scheduledTime: '10:00', status: 'scheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm19', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'Semifinals', scheduledDate: '2024-08-17', scheduledTime: '12:00', status: 'scheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm20', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'Final', scheduledDate: '2024-08-17', scheduledTime: '16:00', status: 'scheduled', courtId: 'c1', courtName: 'Center Court', estimatedDuration: 120, priority: 'high', createdAt: new Date(), updatedAt: new Date() }
]

// Generate fresh/unscheduled matches (for fresh tournament)
const generateUnscheduledMatches = (): Match[] => [
  { id: 'm1', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'First Round', player1Id: 'p1', player1Name: 'John Smith', player2Id: 'p3', player2Name: 'Michael Brown', status: 'unscheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm2', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'First Round', player1Id: 'p5', player1Name: 'David Wilson', player2Id: 'p7', player2Name: 'James Taylor', status: 'unscheduled', estimatedDuration: 90, priority: 'medium', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm3', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'First Round', player1Id: 'p9', player1Name: 'Robert Thomas', player2Id: 'p11', player2Name: 'Daniel Garcia', status: 'unscheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm4', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'First Round', player1Id: 'p13', player1Name: 'Christopher Lee', player2Id: 'p15', player2Name: 'Kevin Harris', status: 'unscheduled', estimatedDuration: 90, priority: 'medium', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm5', drawId: 'd2', drawName: 'Women\'s Singles', roundName: 'First Round', player1Id: 'p2', player1Name: 'Emma Johnson', player2Id: 'p4', player2Name: 'Sarah Davis', status: 'unscheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm6', drawId: 'd2', drawName: 'Women\'s Singles', roundName: 'First Round', player1Id: 'p6', player1Name: 'Lisa Miller', player2Id: 'p8', player2Name: 'Amanda Anderson', status: 'unscheduled', estimatedDuration: 90, priority: 'medium', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm7', drawId: 'd2', drawName: 'Women\'s Singles', roundName: 'First Round', player1Id: 'p10', player1Name: 'Jessica Martinez', player2Id: 'p12', player2Name: 'Ashley Rodriguez', status: 'unscheduled', estimatedDuration: 90, priority: 'medium', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm8', drawId: 'd2', drawName: 'Women\'s Singles', roundName: 'First Round', player1Id: 'p14', player1Name: 'Megan White', player2Id: 'p16', player2Name: 'Rachel Clark', status: 'unscheduled', estimatedDuration: 90, priority: 'low', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm9', drawId: 'd3', drawName: 'Men\'s Doubles', roundName: 'Quarterfinals', player1Name: 'Smith/Brown', player2Name: 'Wilson/Taylor', status: 'unscheduled', isDoubles: true, estimatedDuration: 120, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm10', drawId: 'd3', drawName: 'Men\'s Doubles', roundName: 'Quarterfinals', player1Name: 'Thomas/Garcia', player2Name: 'Lee/Harris', status: 'unscheduled', isDoubles: true, estimatedDuration: 120, priority: 'medium', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm11', drawId: 'd4', drawName: 'Women\'s Doubles', roundName: 'Semifinals', player1Name: 'Johnson/Davis', player2Name: 'Miller/Anderson', status: 'unscheduled', isDoubles: true, estimatedDuration: 120, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm12', drawId: 'd4', drawName: 'Women\'s Doubles', roundName: 'Semifinals', player1Name: 'Martinez/Rodriguez', player2Name: 'White/Clark', status: 'unscheduled', isDoubles: true, estimatedDuration: 120, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm13', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'Quarterfinals', status: 'unscheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm14', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'Quarterfinals', status: 'unscheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm15', drawId: 'd2', drawName: 'Women\'s Singles', roundName: 'Quarterfinals', status: 'unscheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm16', drawId: 'd2', drawName: 'Women\'s Singles', roundName: 'Quarterfinals', status: 'unscheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm17', drawId: 'd5', drawName: 'Mixed Doubles', roundName: 'Final', status: 'unscheduled', isDoubles: true, estimatedDuration: 120, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm18', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'Semifinals', status: 'unscheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm19', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'Semifinals', status: 'unscheduled', estimatedDuration: 90, priority: 'high', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm20', drawId: 'd1', drawName: 'Men\'s Singles', roundName: 'Final', status: 'unscheduled', estimatedDuration: 120, priority: 'high', createdAt: new Date(), updatedAt: new Date() }
]

// Generate comprehensive mock data
const generateMockData = (): TournamentState => {
  const players: Player[] = [
    { id: 'p1', firstName: 'John', lastName: 'Smith', email: 'john@example.com', sportyaLevelSingles: 7, sportyaLevelDoubles: 6, joinedDate: new Date('2023-01-15') },
    { id: 'p2', firstName: 'Emma', lastName: 'Johnson', email: 'emma@example.com', sportyaLevelSingles: 8, sportyaLevelDoubles: 7, joinedDate: new Date('2023-02-20') },
    { id: 'p3', firstName: 'Michael', lastName: 'Brown', email: 'michael@example.com', sportyaLevelSingles: 6, sportyaLevelDoubles: 6, joinedDate: new Date('2023-03-10') },
    { id: 'p4', firstName: 'Sarah', lastName: 'Davis', email: 'sarah@example.com', sportyaLevelSingles: 9, sportyaLevelDoubles: 8, joinedDate: new Date('2023-01-25') },
    { id: 'p5', firstName: 'David', lastName: 'Wilson', email: 'david@example.com', sportyaLevelSingles: 5, sportyaLevelDoubles: 5, joinedDate: new Date('2023-04-05') },
    { id: 'p6', firstName: 'Lisa', lastName: 'Miller', email: 'lisa@example.com', sportyaLevelSingles: 7, sportyaLevelDoubles: 8, joinedDate: new Date('2023-02-14') },
    { id: 'p7', firstName: 'James', lastName: 'Taylor', email: 'james@example.com', sportyaLevelSingles: 8, sportyaLevelDoubles: 7, joinedDate: new Date('2023-03-22') },
    { id: 'p8', firstName: 'Amanda', lastName: 'Anderson', email: 'amanda@example.com', sportyaLevelSingles: 6, sportyaLevelDoubles: 7, joinedDate: new Date('2023-04-18') },
    { id: 'p9', firstName: 'Robert', lastName: 'Thomas', email: 'robert@example.com', sportyaLevelSingles: 9, sportyaLevelDoubles: 9, joinedDate: new Date('2023-01-30') },
    { id: 'p10', firstName: 'Jessica', lastName: 'Martinez', email: 'jessica@example.com', sportyaLevelSingles: 7, sportyaLevelDoubles: 6, joinedDate: new Date('2023-03-15') },
    { id: 'p11', firstName: 'Daniel', lastName: 'Garcia', email: 'daniel@example.com', sportyaLevelSingles: 8, sportyaLevelDoubles: 8, joinedDate: new Date('2023-02-08') },
    { id: 'p12', firstName: 'Ashley', lastName: 'Rodriguez', email: 'ashley@example.com', sportyaLevelSingles: 6, sportyaLevelDoubles: 5, joinedDate: new Date('2023-04-12') },
    { id: 'p13', firstName: 'Christopher', lastName: 'Lee', email: 'chris@example.com', sportyaLevelSingles: 7, sportyaLevelDoubles: 7, joinedDate: new Date('2023-01-20') },
    { id: 'p14', firstName: 'Megan', lastName: 'White', email: 'megan@example.com', sportyaLevelSingles: 5, sportyaLevelDoubles: 6, joinedDate: new Date('2023-03-28') },
    { id: 'p15', firstName: 'Kevin', lastName: 'Harris', email: 'kevin@example.com', sportyaLevelSingles: 8, sportyaLevelDoubles: 7, joinedDate: new Date('2023-02-25') },
    { id: 'p16', firstName: 'Rachel', lastName: 'Clark', email: 'rachel@example.com', sportyaLevelSingles: 9, sportyaLevelDoubles: 8, joinedDate: new Date('2023-04-01') }
  ]

  const courts: Court[] = [
    { id: 'c1', name: 'Center Court', surface: 'hard', indoor: false, lighting: true, isFinalsCourt: true, capacity: 200, bookingPriority: 1 },
    { id: 'c2', name: 'Court 2', surface: 'hard', indoor: false, lighting: true, capacity: 100, bookingPriority: 2 },
    { id: 'c3', name: 'Court 3', surface: 'clay', indoor: false, lighting: false, capacity: 80, bookingPriority: 3 },
    { id: 'c4', name: 'Indoor Court A', surface: 'hard', indoor: true, lighting: true, capacity: 60, bookingPriority: 4 },
    { id: 'c5', name: 'Indoor Court B', surface: 'carpet', indoor: true, lighting: true, capacity: 60, bookingPriority: 5 },
    { id: 'c6', name: 'Practice Court', surface: 'hard', indoor: false, lighting: true, capacity: 40, bookingPriority: 6 },
    { id: 'c7', name: 'Court 7', surface: 'hard', indoor: false, lighting: true, capacity: 90, bookingPriority: 7 },
    { id: 'c8', name: 'Court 8', surface: 'clay', indoor: false, lighting: false, capacity: 70, bookingPriority: 8 }
  ]

  // Start with fresh tournament (unscheduled matches)
  const matches = generateUnscheduledMatches()

  // Simplified blockers - only keep essential demo data
  const blockers: Blocker[] = []

  const draws: TournamentDraw[] = [
    { id: 'd1', name: 'Men&apos;s Singles', format: 'single-elimination', category: 'mens-singles', maxPlayers: 32, currentPlayers: 28, status: 'in-progress', prizeMoney: 10000, entryCost: 50 },
    { id: 'd2', name: 'Women&apos;s Singles', format: 'single-elimination', category: 'womens-singles', maxPlayers: 32, currentPlayers: 24, status: 'in-progress', prizeMoney: 10000, entryCost: 50 },
    { id: 'd3', name: 'Men&apos;s Doubles', format: 'double-elimination', category: 'mens-doubles', maxPlayers: 16, currentPlayers: 14, status: 'in-progress', prizeMoney: 6000, entryCost: 80 },
    { id: 'd4', name: 'Women&apos;s Doubles', format: 'double-elimination', category: 'womens-doubles', maxPlayers: 16, currentPlayers: 12, status: 'in-progress', prizeMoney: 6000, entryCost: 80 },
    { id: 'd5', name: 'Mixed Doubles', format: 'single-elimination', category: 'mixed-doubles', maxPlayers: 16, currentPlayers: 10, status: 'open', prizeMoney: 4000, entryCost: 60 }
  ]

  return {
    players,
    courts,
    matches,
    blockers,
    draws,
    selectedMatch: null,
    conflicts: [],
    currentView: 'grid',
    selectedDate: '2024-08-15',
    loading: false,
    error: null
  }
}

// Reducer function
const tournamentReducer = (state: TournamentState, action: TournamentAction): TournamentState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_SELECTED_MATCH':
      return { ...state, selectedMatch: action.payload }
    
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload }
    
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload }
    
    case 'UPDATE_MATCH':
      return {
        ...state,
        matches: state.matches.map(match => 
          match.id === action.payload.matchId 
            ? { ...match, ...action.payload.updates, updatedAt: new Date() }
            : match
        )
      }
    
    case 'MOVE_MATCH':
      return {
        ...state,
        matches: state.matches.map(match => 
          match.id === action.payload.matchId 
            ? { 
                ...match, 
                courtId: action.payload.courtId,
                courtName: state.courts.find(c => c.id === action.payload.courtId)?.name,
                scheduledTime: action.payload.timeSlot,
                updatedAt: new Date()
              }
            : match
        )
      }
    
    case 'ADD_BLOCKER':
      return {
        ...state,
        blockers: [...state.blockers, action.payload]
      }
    
    case 'REMOVE_BLOCKER':
      return {
        ...state,
        blockers: state.blockers.filter(blocker => blocker.id !== action.payload)
      }
    
    case 'ADD_COURT':
      return {
        ...state,
        courts: [...state.courts, action.payload]
      }
    
    case 'UPDATE_COURT':
      return {
        ...state,
        courts: state.courts.map(court => 
          court.id === action.payload.courtId 
            ? { ...court, ...action.payload.updates }
            : court
        )
      }
    
    case 'DELETE_COURT':
      return {
        ...state,
        courts: state.courts.filter(court => court.id !== action.payload),
        // Also remove matches and blockers associated with the deleted court
        matches: state.matches.filter(match => match.courtId !== action.payload),
        blockers: state.blockers.filter(blocker => blocker.courtId !== action.payload)
      }
    
    case 'SET_CONFLICTS':
      return { ...state, conflicts: action.payload }
    
    case 'CLEAR_CONFLICTS':
      return { ...state, conflicts: [] }
    
    case 'APPLY_SCHEDULE':
      return { ...state, matches: action.payload }
    
    case 'RESET_SCHEDULE':
      // Create fresh unscheduled matches to avoid reference issues
      const freshMatches = generateUnscheduledMatches()
      return { ...state, matches: freshMatches }
    
    default:
      return state
  }
}

// Create context
const TournamentContext = createContext<TournamentContextType | undefined>(undefined)

// Provider component
export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tournamentReducer, generateMockData())

  // Action creators
  const setSelectedMatch = (match: Match | null) => {
    dispatch({ type: 'SET_SELECTED_MATCH', payload: match })
  }

  const setCurrentView = (view: ViewMode) => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: view })
  }

  const setSelectedDate = (date: string) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date })
  }

  const updateMatch = (matchId: string, updates: Partial<Match>) => {
    dispatch({ type: 'UPDATE_MATCH', payload: { matchId, updates } })
  }

  const updateMatchStatus = (matchId: string, status: MatchStatus) => {
    updateMatch(matchId, { status })
  }

  const moveMatch = (matchId: string, courtId: string, timeSlot: string) => {
    dispatch({ type: 'MOVE_MATCH', payload: { matchId, courtId, timeSlot } })
  }

  const addBlocker = (blocker: Omit<Blocker, 'id' | 'createdAt'>) => {
    const newBlocker: Blocker = {
      ...blocker,
      id: `b${Date.now()}`,
      createdAt: new Date()
    }
    dispatch({ type: 'ADD_BLOCKER', payload: newBlocker })
  }

  const removeBlocker = (blockerId: string) => {
    dispatch({ type: 'REMOVE_BLOCKER', payload: blockerId })
  }

  const checkConflicts = () => {
    const conflicts: ScheduleConflict[] = []
    
    // Check for player double bookings
    const playerSchedule = new Map<string, { matchId: string; time: string; date: string }[]>()
    
    state.matches.forEach(match => {
      if (match.scheduledDate && match.scheduledTime && match.status !== 'completed') {
        [match.player1Id, match.player2Id].forEach(playerId => {
          if (playerId) {
            if (!playerSchedule.has(playerId)) {
              playerSchedule.set(playerId, [])
            }
            if (match.scheduledTime && match.scheduledDate) {
              playerSchedule.get(playerId)!.push({
                matchId: match.id,
                time: match.scheduledTime,
                date: match.scheduledDate
              })
            }
          }
        })
      }
    })

    // Detect conflicts
    playerSchedule.forEach((schedule, playerId) => {
      const sortedSchedule = schedule.sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
      
      for (let i = 0; i < sortedSchedule.length - 1; i++) {
        if (sortedSchedule[i].date === sortedSchedule[i + 1].date && 
            sortedSchedule[i].time === sortedSchedule[i + 1].time) {
          conflicts.push({
            id: `conflict-${Date.now()}-${i}`,
            type: 'player-double-booking',
            severity: 'error',
            matchId: sortedSchedule[i].matchId,
            playerId: playerId,
            message: `Player has conflicting matches at ${sortedSchedule[i].time} on ${sortedSchedule[i].date}`,
            suggestedResolution: 'Reschedule one of the matches to a different time slot'
          })
        }
      }
    })

    dispatch({ type: 'SET_CONFLICTS', payload: conflicts })
  }

  const addCourt = (court: Court) => {
    dispatch({ type: 'ADD_COURT', payload: court })
  }

  const updateCourt = (courtId: string, updates: Partial<Court>) => {
    dispatch({ type: 'UPDATE_COURT', payload: { courtId, updates } })
  }

  const deleteCourt = (courtId: string) => {
    dispatch({ type: 'DELETE_COURT', payload: courtId })
  }

  const clearConflicts = () => {
    dispatch({ type: 'CLEAR_CONFLICTS' })
  }

  const applySchedule = React.useCallback(() => {
    const scheduledMatches = generateScheduledMatches()
    dispatch({ type: 'APPLY_SCHEDULE', payload: scheduledMatches })
  }, [])

  const resetSchedule = React.useCallback(() => {
    dispatch({ type: 'RESET_SCHEDULE' })
  }, [])

  const contextValue: TournamentContextType = React.useMemo(() => ({
    state,
    dispatch,
    setSelectedMatch,
    setCurrentView,
    setSelectedDate,
    updateMatch,
    updateMatchStatus,
    moveMatch,
    addBlocker,
    removeBlocker,
    addCourt,
    updateCourt,
    deleteCourt,
    checkConflicts,
    clearConflicts,
    applySchedule,
    resetSchedule
  }), [
    state, 
    setSelectedMatch,
    setCurrentView,
    setSelectedDate,
    updateMatch,
    updateMatchStatus,
    moveMatch,
    addBlocker,
    removeBlocker,
    addCourt,
    updateCourt,
    deleteCourt,
    checkConflicts,
    clearConflicts,
    applySchedule,
    resetSchedule
  ])

  return (
    <TournamentContext.Provider value={contextValue}>
      {children}
    </TournamentContext.Provider>
  )
}

// Hook to use tournament context
export const useTournament = (): TournamentContextType => {
  const context = useContext(TournamentContext)
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider')
  }
  return context
}

export default TournamentContext