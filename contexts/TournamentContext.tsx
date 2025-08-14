import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import {
  TournamentState,
  Match,
  Court,
  Player,
  Draw,
  Blocker,
  SchedulingConfig,
  ScheduleOption,
  NotificationTemplate,
  PlayerAvailability,
  BlockerType,
  MatchStatus
} from '@/types/tournament'

interface TournamentContextValue {
  state: TournamentState
  updateMatch: (matchId: string, updates: Partial<Match>) => void
  updateMatchStatus: (matchId: string, status: MatchStatus) => void
  addCourt: (court: Court) => void
  removeCourt: (courtId: string) => void
  updateCourt: (courtId: string, updates: Partial<Court>) => void
  updateConfig: (config: Partial<SchedulingConfig>) => void
  addBlocker: (blocker: Blocker) => void
  resolveBlocker: (blockerId: string) => void
  setScheduleStatus: (status: 'private' | 'public') => void
  generateScheduleOptions: () => Promise<ScheduleOption[]>
  selectScheduleOption: (optionId: string) => void
  updatePlayerAvailability: (availability: PlayerAvailability) => void
  rescheduleMatch: (matchId: string, courtId: string, date: string, time: string) => void
  bulkRescheduleRound: (drawId: string, round: string, date: string) => void
  detectBlockers: () => void
  addNotificationTemplate: (template: NotificationTemplate) => void
  resetSchedule: () => void
}

const TournamentContext = createContext<TournamentContextValue | undefined>(undefined)

export function useTournament() {
  const context = useContext(TournamentContext)
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider')
  }
  return context
}

const generateMockData = (): TournamentState => {
  // Enhanced player roster with diverse profiles
  const players: Player[] = [
    { id: 'p1', firstName: 'John', lastName: 'Smith', email: 'john@example.com', phone: '555-0001', sportyaLevelSingles: 7, sportyaLevelDoubles: 6, joinedDate: new Date('2023-01-15'), availability: { 'day1': ['daytime', 'evening'], 'day2': ['morning', 'daytime'] } },
    { id: 'p2', firstName: 'Mike', lastName: 'Wilson', email: 'mike@example.com', phone: '555-0002', sportyaLevelSingles: 6, sportyaLevelDoubles: 7, joinedDate: new Date('2023-02-20'), availability: { 'day1': ['morning', 'daytime'], 'day2': ['daytime', 'evening'] } },
    { id: 'p3', firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com', phone: '555-0003', sportyaLevelSingles: 8, sportyaLevelDoubles: 7, joinedDate: new Date('2022-11-10'), availability: { 'day1': ['evening'], 'day2': ['morning', 'daytime', 'evening'] } },
    { id: 'p4', firstName: 'Emily', lastName: 'Davis', email: 'emily@example.com', phone: '555-0004', sportyaLevelSingles: 7, sportyaLevelDoubles: 8, joinedDate: new Date('2023-03-05'), availability: { 'day1': ['morning', 'daytime', 'evening'], 'day2': ['morning'] } },
    { id: 'p5', firstName: 'David', lastName: 'Brown', email: 'david@example.com', phone: '555-0005', sportyaLevelSingles: 6, sportyaLevelDoubles: 6, joinedDate: new Date('2023-04-12'), availability: { 'day1': ['daytime'], 'day2': ['daytime', 'evening'] } },
    { id: 'p6', firstName: 'Tom', lastName: 'Anderson', email: 'tom@example.com', phone: '555-0006', sportyaLevelSingles: 7, sportyaLevelDoubles: 6, joinedDate: new Date('2022-12-08'), availability: { 'day1': ['morning', 'evening'], 'day2': ['daytime'] } },
    { id: 'p7', firstName: 'Lisa', lastName: 'Garcia', email: 'lisa@example.com', phone: '555-0007', sportyaLevelSingles: 8, sportyaLevelDoubles: 9, joinedDate: new Date('2023-01-25'), availability: { 'day1': ['morning', 'daytime'], 'day2': ['evening'] } },
    { id: 'p8', firstName: 'Anna', lastName: 'Martinez', email: 'anna@example.com', phone: '555-0008', sportyaLevelSingles: 7, sportyaLevelDoubles: 7, joinedDate: new Date('2023-02-14'), availability: { 'day1': ['daytime', 'evening'], 'day2': ['morning', 'daytime'] } },
    { id: 'p9', firstName: 'Robert', lastName: 'Taylor', email: 'robert@example.com', phone: '555-0009', sportyaLevelSingles: 9, sportyaLevelDoubles: 8, joinedDate: new Date('2022-08-30'), availability: { 'day1': ['morning', 'daytime'], 'day2': ['daytime', 'evening'] } },
    { id: 'p10', firstName: 'Jessica', lastName: 'Lee', email: 'jessica@example.com', phone: '555-0010', sportyaLevelSingles: 8, sportyaLevelDoubles: 9, joinedDate: new Date('2023-01-10'), availability: { 'day1': ['evening'], 'day2': ['morning', 'daytime'] } },
    { id: 'p11', firstName: 'Alex', lastName: 'Rodriguez', email: 'alex@example.com', phone: '555-0011', sportyaLevelSingles: 7, sportyaLevelDoubles: 7, joinedDate: new Date('2022-11-15'), availability: { 'day1': ['morning', 'daytime', 'evening'], 'day2': ['daytime'] } },
    { id: 'p12', firstName: 'Maria', lastName: 'Gonzalez', email: 'maria@example.com', phone: '555-0012', sportyaLevelSingles: 6, sportyaLevelDoubles: 8, joinedDate: new Date('2023-03-20'), availability: { 'day1': ['daytime'], 'day2': ['morning', 'evening'] } },
    { id: 'p13', firstName: 'Chris', lastName: 'Thompson', email: 'chris@example.com', phone: '555-0013', sportyaLevelSingles: 8, sportyaLevelDoubles: 7, joinedDate: new Date('2023-02-01'), availability: { 'day1': ['morning', 'evening'], 'day2': ['daytime', 'evening'] } },
    { id: 'p14', firstName: 'Rachel', lastName: 'White', email: 'rachel@example.com', phone: '555-0014', sportyaLevelSingles: 7, sportyaLevelDoubles: 6, joinedDate: new Date('2022-12-12'), availability: { 'day1': ['daytime', 'evening'], 'day2': ['morning', 'daytime'] } },
    { id: 'p15', firstName: 'Mark', lastName: 'Johnson', email: 'mark@example.com', phone: '555-0015', sportyaLevelSingles: 6, sportyaLevelDoubles: 7, joinedDate: new Date('2023-04-05'), availability: { 'day1': ['morning', 'daytime'], 'day2': ['evening'] } },
    { id: 'p16', firstName: 'Sophie', lastName: 'Miller', email: 'sophie@example.com', phone: '555-0016', sportyaLevelSingles: 9, sportyaLevelDoubles: 8, joinedDate: new Date('2022-10-20'), availability: { 'day1': ['evening'], 'day2': ['morning', 'daytime', 'evening'] } },
  ]

  // Enhanced court facilities
  const courts: Court[] = [
    { id: 'c1', name: 'Center Court', surface: 'hard', indoor: false, lighting: true, isFinalsCourt: true, availability: [
      { date: '2024-07-15', startTime: '08:00', endTime: '22:00' }, 
      { date: '2024-07-16', startTime: '08:00', endTime: '22:00' },
      { date: '2024-07-17', startTime: '08:00', endTime: '22:00' }
    ]},
    { id: 'c2', name: 'Court 2', surface: 'hard', indoor: false, lighting: true, availability: [
      { date: '2024-07-15', startTime: '08:00', endTime: '22:00' }, 
      { date: '2024-07-16', startTime: '08:00', endTime: '22:00' },
      { date: '2024-07-17', startTime: '08:00', endTime: '22:00' }
    ]},
    { id: 'c3', name: 'Court 3', surface: 'clay', indoor: true, lighting: true, availability: [
      { date: '2024-07-15', startTime: '08:00', endTime: '22:00' }, 
      { date: '2024-07-16', startTime: '08:00', endTime: '22:00' },
      { date: '2024-07-17', startTime: '08:00', endTime: '22:00' }
    ]},
    { id: 'c4', name: 'Court 4', surface: 'clay', indoor: true, lighting: true, availability: [
      { date: '2024-07-15', startTime: '08:00', endTime: '20:00' }, 
      { date: '2024-07-16', startTime: '08:00', endTime: '20:00' },
      { date: '2024-07-17', startTime: '08:00', endTime: '20:00' }
    ]},
    { id: 'c5', name: 'Court 5', surface: 'hard', indoor: true, lighting: true, availability: [
      { date: '2024-07-15', startTime: '09:00', endTime: '21:00' }, 
      { date: '2024-07-16', startTime: '09:00', endTime: '21:00' },
      { date: '2024-07-17', startTime: '09:00', endTime: '21:00' }
    ]},
    { id: 'c6', name: 'Practice Court', surface: 'hard', indoor: false, lighting: false, availability: [
      { date: '2024-07-15', startTime: '08:00', endTime: '18:00', blocked: true, reason: 'Court maintenance' }, 
      { date: '2024-07-16', startTime: '08:00', endTime: '20:00' },
      { date: '2024-07-17', startTime: '08:00', endTime: '20:00' }
    ]},
  ]

  // Enhanced tournament draws
  const draws: Draw[] = [
    {
      id: 'd1',
      name: "Men's Singles",
      format: 'singles',
      type: 'knockout',
      numberOfPlayers: 16,
      rounds: ['Round 1', 'Round 2', 'Quarterfinals', 'Semifinals', 'Final'],
      matches: [],
      preferences: {
        preferredCourts: ['c1', 'c2'],
        preferredTimeSlots: ['14:00-18:00'],
        maxMatchesPerDay: 2
      }
    },
    {
      id: 'd2',
      name: "Women's Singles",
      format: 'singles',
      type: 'knockout',
      numberOfPlayers: 16,
      rounds: ['Round 1', 'Round 2', 'Quarterfinals', 'Semifinals', 'Final'],
      matches: [],
      preferences: {
        preferredCourts: ['c1', 'c3'],
        preferredTimeSlots: ['10:00-14:00'],
        maxMatchesPerDay: 2
      }
    },
    {
      id: 'd3',
      name: "Mixed Doubles",
      format: 'doubles',
      type: 'knockout',
      numberOfPlayers: 8,
      rounds: ['Round 1', 'Semifinals', 'Final'],
      matches: [],
      preferences: {
        preferredCourts: ['c2', 'c3', 'c4'],
        preferredTimeSlots: ['16:00-20:00'],
        maxMatchesPerDay: 1
      }
    }
  ]

  // Comprehensive match schedule with realistic scenarios
  const matches: Match[] = [
    // Men's Singles Round 1
    { id: 'm1', drawId: 'd1', drawName: "Men's Singles", format: 'singles', round: 'Round 1', player1Id: 'p1', player2Id: 'p2', player1Name: 'John Smith', player2Name: 'Mike Wilson', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-07-15', scheduledTime: '09:00', duration: 90, status: 'completed', score: '6-4, 6-2' },
    { id: 'm2', drawId: 'd1', drawName: "Men's Singles", format: 'singles', round: 'Round 1', player1Id: 'p5', player2Id: 'p6', player1Name: 'David Brown', player2Name: 'Tom Anderson', courtId: 'c2', courtName: 'Court 2', scheduledDate: '2024-07-15', scheduledTime: '09:00', duration: 90, status: 'completed', score: '6-4, 3-6, 6-2' },
    { id: 'm3', drawId: 'd1', drawName: "Men's Singles", format: 'singles', round: 'Round 1', player1Id: 'p9', player2Id: 'p11', player1Name: 'Robert Taylor', player2Name: 'Alex Rodriguez', courtId: 'c3', courtName: 'Court 3', scheduledDate: '2024-07-15', scheduledTime: '10:30', duration: 90, status: 'in-progress', score: '6-4, 3-2' },
    { id: 'm4', drawId: 'd1', drawName: "Men's Singles", format: 'singles', round: 'Round 1', player1Id: 'p13', player2Id: 'p15', player1Name: 'Chris Thompson', player2Name: 'Mark Johnson', courtId: 'c4', courtName: 'Court 4', scheduledDate: '2024-07-15', scheduledTime: '10:30', duration: 90, status: 'scheduled' },
    
    // Women's Singles Round 1
    { id: 'm5', drawId: 'd2', drawName: "Women's Singles", format: 'singles', round: 'Round 1', player1Id: 'p3', player2Id: 'p4', player1Name: 'Sarah Johnson', player2Name: 'Emily Davis', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-07-15', scheduledTime: '12:00', duration: 90, status: 'completed', score: '6-3, 4-6, 6-1' },
    { id: 'm6', drawId: 'd2', drawName: "Women's Singles", format: 'singles', round: 'Round 1', player1Id: 'p7', player2Id: 'p8', player1Name: 'Lisa Garcia', player2Name: 'Anna Martinez', courtId: 'c2', courtName: 'Court 2', scheduledDate: '2024-07-15', scheduledTime: '12:00', duration: 90, status: 'completed', score: '6-2, 6-4' },
    { id: 'm7', drawId: 'd2', drawName: "Women's Singles", format: 'singles', round: 'Round 1', player1Id: 'p10', player2Id: 'p12', player1Name: 'Jessica Lee', player2Name: 'Maria Gonzalez', courtId: 'c3', courtName: 'Court 3', scheduledDate: '2024-07-15', scheduledTime: '13:30', duration: 90, status: 'scheduled' },
    { id: 'm8', drawId: 'd2', drawName: "Women's Singles", format: 'singles', round: 'Round 1', player1Id: 'p14', player2Id: 'p16', player1Name: 'Rachel White', player2Name: 'Sophie Miller', courtId: 'c4', courtName: 'Court 4', scheduledDate: '2024-07-15', scheduledTime: '13:30', duration: 90, status: 'scheduled' },
    
    // Quarterfinals
    { id: 'm9', drawId: 'd1', drawName: "Men's Singles", format: 'singles', round: 'Quarterfinals', player1Id: 'p1', player2Id: 'p5', player1Name: 'John Smith', player2Name: 'David Brown', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-07-15', scheduledTime: '15:00', duration: 90, status: 'scheduled', dependencies: ['m1', 'm2'] },
    { id: 'm10', drawId: 'd1', drawName: "Men's Singles", format: 'singles', round: 'Quarterfinals', player1Id: 'p9', player2Id: 'p13', player1Name: 'Robert Taylor', player2Name: 'Chris Thompson', courtId: 'c2', courtName: 'Court 2', scheduledDate: '2024-07-15', scheduledTime: '15:00', duration: 90, status: 'scheduled', dependencies: ['m3', 'm4'] },
    { id: 'm11', drawId: 'd2', drawName: "Women's Singles", format: 'singles', round: 'Quarterfinals', player1Id: 'p3', player2Id: 'p7', player1Name: 'Sarah Johnson', player2Name: 'Lisa Garcia', courtId: 'c3', courtName: 'Court 3', scheduledDate: '2024-07-15', scheduledTime: '16:30', duration: 90, status: 'scheduled', dependencies: ['m5', 'm6'] },
    { id: 'm12', drawId: 'd2', drawName: "Women's Singles", format: 'singles', round: 'Quarterfinals', player1Id: 'p10', player2Id: 'p16', player1Name: 'Jessica Lee', player2Name: 'Sophie Miller', courtId: 'c4', courtName: 'Court 4', scheduledDate: '2024-07-15', scheduledTime: '16:30', duration: 90, status: 'scheduled', dependencies: ['m7', 'm8'] },
    
    // Mixed Doubles
    { id: 'm13', drawId: 'd3', drawName: "Mixed Doubles", format: 'doubles', round: 'Round 1', player1Id: 'p1', player2Id: 'p3', player1Name: 'John Smith / Sarah Johnson', player2Name: 'Mike Wilson / Emily Davis', courtId: 'c5', courtName: 'Court 5', scheduledDate: '2024-07-15', scheduledTime: '18:00', duration: 90, status: 'scheduled' },
    { id: 'm14', drawId: 'd3', drawName: "Mixed Doubles", format: 'doubles', round: 'Round 1', player1Id: 'p9', player2Id: 'p7', player1Name: 'Robert Taylor / Lisa Garcia', player2Name: 'Alex Rodriguez / Anna Martinez', courtId: 'c2', courtName: 'Court 2', scheduledDate: '2024-07-15', scheduledTime: '18:00', duration: 90, status: 'scheduled' },
    
    // Day 2 matches
    { id: 'm15', drawId: 'd1', drawName: "Men's Singles", format: 'singles', round: 'Semifinals', player1Id: 'p1', player2Id: 'p9', player1Name: 'John Smith', player2Name: 'Robert Taylor', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-07-16', scheduledTime: '14:00', duration: 90, status: 'scheduled', dependencies: ['m9', 'm10'] },
    { id: 'm16', drawId: 'd2', drawName: "Women's Singles", format: 'singles', round: 'Semifinals', player1Id: 'p3', player2Id: 'p16', player1Name: 'Sarah Johnson', player2Name: 'Sophie Miller', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-07-16', scheduledTime: '16:00', duration: 90, status: 'scheduled', dependencies: ['m11', 'm12'] },
    
    // Finals
    { id: 'm17', drawId: 'd1', drawName: "Men's Singles", format: 'singles', round: 'Final', player1Id: 'p1', player2Id: 'p9', player1Name: 'John Smith', player2Name: 'Robert Taylor', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-07-17', scheduledTime: '15:00', duration: 120, status: 'scheduled', dependencies: ['m15'] },
    { id: 'm18', drawId: 'd2', drawName: "Women's Singles", format: 'singles', round: 'Final', player1Id: 'p3', player2Id: 'p16', player1Name: 'Sarah Johnson', player2Name: 'Sophie Miller', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-07-17', scheduledTime: '17:30', duration: 120, status: 'scheduled', dependencies: ['m16'] },
    
    // Some problematic matches for testing
    { id: 'm19', drawId: 'd1', drawName: "Men's Singles", format: 'singles', round: 'Round 1', player1Id: 'p1', player2Id: 'p6', player1Name: 'John Smith', player2Name: 'Tom Anderson', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-07-15', scheduledTime: '11:00', duration: 90, status: 'postponed' },
    { id: 'm20', drawId: 'd2', drawName: "Women's Singles", format: 'singles', round: 'Round 1', player1Id: 'p4', player2Id: 'p8', player1Name: 'Emily Davis', player2Name: 'Anna Martinez', courtId: 'c6', courtName: 'Practice Court', scheduledDate: '2024-07-15', scheduledTime: '14:00', duration: 90, status: 'walkover' },
  ]

  // Comprehensive blocker scenarios for testing
  const blockers: Blocker[] = [
    { 
      id: 'b1', 
      type: 'rest-violation', 
      severity: 'warning', 
      description: 'John Smith has less than 90 minutes rest between matches m1 and m9', 
      affectedMatches: ['m1', 'm9'], 
      isResolved: false, 
      createdAt: new Date('2024-07-15T08:30:00'), 
      suggestedResolution: 'Reschedule match m9 to 16:00 or later'
    },
    { 
      id: 'b2', 
      type: 'availability-conflict', 
      severity: 'critical', 
      description: 'Sarah Johnson marked as unavailable during morning slot on Day 1', 
      affectedMatches: ['m5'], 
      isResolved: false, 
      createdAt: new Date('2024-07-15T07:45:00'), 
      suggestedResolution: 'Move match to afternoon or get player confirmation'
    },
    { 
      id: 'b3', 
      type: 'court-conflict', 
      severity: 'critical', 
      description: 'Practice Court (Court 6) is blocked for maintenance during scheduled match time', 
      affectedMatches: ['m20'], 
      isResolved: false, 
      createdAt: new Date('2024-07-15T06:00:00'), 
      suggestedResolution: 'Reassign match to Court 2 or Court 3'
    },
    { 
      id: 'b4', 
      type: 'schedule-conflict', 
      severity: 'warning', 
      description: 'Two matches scheduled simultaneously on Center Court', 
      affectedMatches: ['m1', 'm19'], 
      isResolved: false, 
      createdAt: new Date('2024-07-15T08:15:00'), 
      suggestedResolution: 'Reschedule one match to different time or court'
    },
    { 
      id: 'b5', 
      type: 'dependency', 
      severity: 'info', 
      description: 'Quarterfinal match depends on completion of Round 1 matches that are running late', 
      affectedMatches: ['m9', 'm10'], 
      isResolved: false, 
      createdAt: new Date('2024-07-15T14:00:00'), 
      suggestedResolution: 'Monitor Round 1 progress and adjust start times accordingly'
    },
    { 
      id: 'b6', 
      type: 'rest-violation', 
      severity: 'critical', 
      description: 'Robert Taylor scheduled for back-to-back matches with no rest period', 
      affectedMatches: ['m3', 'm10'], 
      isResolved: false, 
      createdAt: new Date('2024-07-15T09:30:00'), 
      suggestedResolution: 'Add minimum 30-minute break between matches'
    },
    { 
      id: 'b7', 
      type: 'availability-conflict', 
      severity: 'warning', 
      description: 'Jessica Lee prefers morning matches but scheduled for afternoon', 
      affectedMatches: ['m7'], 
      isResolved: false, 
      createdAt: new Date('2024-07-15T07:20:00'), 
      suggestedResolution: 'Consider swapping with morning match if possible'
    },
    // Some resolved blockers for testing
    { 
      id: 'b8', 
      type: 'court-conflict', 
      severity: 'warning', 
      description: 'Court 4 double-booked for practice session', 
      affectedMatches: ['m4'], 
      isResolved: true, 
      createdAt: new Date('2024-07-14T16:00:00'), 
      suggestedResolution: 'Cancelled conflicting practice session'
    },
    { 
      id: 'b9', 
      type: 'schedule-conflict', 
      severity: 'info', 
      description: 'Mixed doubles overlapping with singles finals preparation', 
      affectedMatches: ['m13'], 
      isResolved: true, 
      createdAt: new Date('2024-07-14T14:30:00'), 
      suggestedResolution: 'Adjusted warm-up schedule'
    },
  ]

  const config: SchedulingConfig = {
    defaultMatchDuration: 90,
    bufferTimeBetweenMatches: 15,
    minimumRestPeriod: 90,
    dailyStartTime: '08:00',
    dailyEndTime: '22:00',
    preferredFinalsCourts: ['c1'],
    indoorCourtUtilization: 'weather-dependent',
    maxMatchesPerPlayerPerDay: 2,
    constraintPriority: ['rest-violation', 'availability-conflict', 'court-conflict', 'schedule-conflict', 'dependency']
  }

  return {
    name: 'Summer Championship 2024',
    startDate: '2024-07-15',
    endDate: '2024-07-18',
    players,
    doublesTeams: [],
    courts,
    draws,
    matches,
    config,
    blockers,
    scheduleStatus: 'private',
    generatedOptions: [],
    lastModified: new Date()
  }
}

export function TournamentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<TournamentState>(generateMockData())

  const updateMatch = useCallback((matchId: string, updates: Partial<Match>) => {
    setState(prev => ({
      ...prev,
      matches: prev.matches.map(m => m.id === matchId ? { ...m, ...updates } : m),
      lastModified: new Date()
    }))
  }, [])

  const updateMatchStatus = useCallback((matchId: string, status: MatchStatus) => {
    setState(prev => ({
      ...prev,
      matches: prev.matches.map(m => m.id === matchId ? { ...m, status } : m),
      lastModified: new Date()
    }))
  }, [])

  const addCourt = useCallback((court: Court) => {
    setState(prev => ({
      ...prev,
      courts: [...prev.courts, court],
      lastModified: new Date()
    }))
  }, [])

  const removeCourt = useCallback((courtId: string) => {
    setState(prev => ({
      ...prev,
      courts: prev.courts.filter(c => c.id !== courtId),
      lastModified: new Date()
    }))
  }, [])

  const updateCourt = useCallback((courtId: string, updates: Partial<Court>) => {
    setState(prev => ({
      ...prev,
      courts: prev.courts.map(c => c.id === courtId ? { ...c, ...updates } : c),
      lastModified: new Date()
    }))
  }, [])

  const updateConfig = useCallback((config: Partial<SchedulingConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...config },
      lastModified: new Date()
    }))
  }, [])

  const addBlocker = useCallback((blocker: Blocker) => {
    setState(prev => ({
      ...prev,
      blockers: [...prev.blockers, blocker],
      lastModified: new Date()
    }))
  }, [])

  const resolveBlocker = useCallback((blockerId: string) => {
    setState(prev => ({
      ...prev,
      blockers: prev.blockers.map(b => b.id === blockerId ? { ...b, isResolved: true } : b),
      lastModified: new Date()
    }))
  }, [])

  const setScheduleStatus = useCallback((status: 'private' | 'public') => {
    setState(prev => ({
      ...prev,
      scheduleStatus: status,
      lastPublished: status === 'public' ? new Date() : prev.lastPublished,
      lastModified: new Date()
    }))
  }, [])

  const generateScheduleOptions = useCallback(async (): Promise<ScheduleOption[]> => {
    // Simulate schedule generation
    return new Promise((resolve) => {
      setTimeout(() => {
        const options: ScheduleOption[] = [
          {
            id: 'opt1',
            name: 'Compact Schedule',
            description: 'Minimizes tournament duration with tight scheduling',
            duration: 3,
            matchCount: state.matches.length,
            courtUtilization: 85,
            playerSatisfaction: 70,
            qualityScore: 78,
            conflicts: 2,
            tradeoffs: ['Higher court utilization', 'Less rest time for players', 'Completes in 3 days'],
            schedule: state.matches
          },
          {
            id: 'opt2',
            name: 'Relaxed Schedule',
            description: 'Provides optimal rest time and player preferences',
            duration: 4,
            matchCount: state.matches.length,
            courtUtilization: 65,
            playerSatisfaction: 92,
            qualityScore: 88,
            conflicts: 0,
            tradeoffs: ['Better player rest', 'Respects all preferences', 'Extends to 4 days'],
            schedule: state.matches
          }
        ]
        setState(prev => ({ ...prev, generatedOptions: options }))
        resolve(options)
      }, 2000)
    })
  }, [state.matches])

  const selectScheduleOption = useCallback((optionId: string) => {
    setState(prev => {
      const option = prev.generatedOptions.find(o => o.id === optionId)
      return option ? { ...prev, selectedScheduleOption: option, lastModified: new Date() } : prev
    })
  }, [])

  const updatePlayerAvailability = useCallback((availability: PlayerAvailability) => {
    setState(prev => ({
      ...prev,
      players: prev.players.map(p => 
        p.id === availability.playerId 
          ? { ...p, availability: { ...p.availability, [availability.date]: availability.periods } }
          : p
      ),
      lastModified: new Date()
    }))
  }, [])

  const rescheduleMatch = useCallback((matchId: string, courtId: string, date: string, time: string) => {
    setState(prev => {
      const court = prev.courts.find(c => c.id === courtId)
      return {
        ...prev,
        matches: prev.matches.map(m => 
          m.id === matchId 
            ? { ...m, courtId, courtName: court?.name, scheduledDate: date, scheduledTime: time }
            : m
        ),
        lastModified: new Date()
      }
    })
  }, [])

  const bulkRescheduleRound = useCallback((drawId: string, round: string, date: string) => {
    setState(prev => ({
      ...prev,
      matches: prev.matches.map(m => 
        m.drawId === drawId && m.round === round 
          ? { ...m, scheduledDate: date }
          : m
      ),
      lastModified: new Date()
    }))
  }, [])

  const detectBlockers = useCallback(() => {
    const newBlockers: Blocker[] = []
    
    // Check for rest violations
    state.players.forEach(player => {
      const playerMatches = state.matches
        .filter(m => m.player1Id === player.id || m.player2Id === player.id)
        .filter(m => m.scheduledDate && m.scheduledTime)
        .sort((a, b) => {
          const dateA = new Date(`${a.scheduledDate} ${a.scheduledTime}`)
          const dateB = new Date(`${b.scheduledDate} ${b.scheduledTime}`)
          return dateA.getTime() - dateB.getTime()
        })

      for (let i = 0; i < playerMatches.length - 1; i++) {
        const match1 = playerMatches[i]
        const match2 = playerMatches[i + 1]
        const time1 = new Date(`${match1.scheduledDate} ${match1.scheduledTime}`)
        const time2 = new Date(`${match2.scheduledDate} ${match2.scheduledTime}`)
        const restMinutes = (time2.getTime() - time1.getTime()) / (1000 * 60)
        
        if (restMinutes < state.config.minimumRestPeriod) {
          newBlockers.push({
            id: `b-rest-${Date.now()}-${i}`,
            type: 'rest-violation',
            severity: 'warning',
            description: `${player.firstName} ${player.lastName} has less than ${state.config.minimumRestPeriod} minutes rest between matches`,
            affectedMatches: [match1.id, match2.id],
            isResolved: false,
            createdAt: new Date()
          })
        }
      }
    })

    // Check for court conflicts
    state.courts.forEach(court => {
      const courtMatches = state.matches
        .filter(m => m.courtId === court.id && m.scheduledDate && m.scheduledTime)
        .sort((a, b) => {
          const dateA = new Date(`${a.scheduledDate} ${a.scheduledTime}`)
          const dateB = new Date(`${b.scheduledDate} ${b.scheduledTime}`)
          return dateA.getTime() - dateB.getTime()
        })

      for (let i = 0; i < courtMatches.length - 1; i++) {
        const match1 = courtMatches[i]
        const match2 = courtMatches[i + 1]
        const end1 = new Date(`${match1.scheduledDate} ${match1.scheduledTime}`)
        end1.setMinutes(end1.getMinutes() + (match1.duration || state.config.defaultMatchDuration))
        const start2 = new Date(`${match2.scheduledDate} ${match2.scheduledTime}`)
        
        if (end1 > start2) {
          newBlockers.push({
            id: `b-court-${Date.now()}-${i}`,
            type: 'court-conflict',
            severity: 'critical',
            description: `Court ${court.name} has overlapping matches`,
            affectedMatches: [match1.id, match2.id],
            isResolved: false,
            createdAt: new Date()
          })
        }
      }
    })

    setState(prev => ({
      ...prev,
      blockers: [...prev.blockers.filter(b => b.isResolved), ...newBlockers],
      lastModified: new Date()
    }))
  }, [state.matches, state.players, state.courts, state.config])

  const addNotificationTemplate = useCallback((template: NotificationTemplate) => {
    // Just store in state for mockup purposes
    console.log('Adding notification template:', template)
  }, [])

  const resetSchedule = useCallback(() => {
    setState(generateMockData())
  }, [])

  const value: TournamentContextValue = {
    state,
    updateMatch,
    updateMatchStatus,
    addCourt,
    removeCourt,
    updateCourt,
    updateConfig,
    addBlocker,
    resolveBlocker,
    setScheduleStatus,
    generateScheduleOptions,
    selectScheduleOption,
    updatePlayerAvailability,
    rescheduleMatch,
    bulkRescheduleRound,
    detectBlockers,
    addNotificationTemplate,
    resetSchedule
  }

  return (
    <TournamentContext.Provider value={value}>
      {children}
    </TournamentContext.Provider>
  )
}