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

// Define consistent colors for draws - using subtle, diffused colors
const DRAW_COLORS = [
  'bg-blue-100 border-blue-300 text-blue-900',       // Level 5 - Singles - Eliminatory
  'bg-purple-100 border-purple-300 text-purple-900', // Level 6 - Singles - Eliminatory  
  'bg-emerald-100 border-emerald-300 text-emerald-900', // Level 7 - Doubles - Groups
  'bg-amber-100 border-amber-300 text-amber-900',    // Level 7 - Doubles - Groups (second)
  'bg-rose-100 border-rose-300 text-rose-900',       // Level 6 - Doubles - Eliminatory
  'bg-indigo-100 border-indigo-300 text-indigo-900',
  'bg-teal-100 border-teal-300 text-teal-900',
  'bg-orange-100 border-orange-300 text-orange-900',
  'bg-yellow-100 border-yellow-300 text-yellow-900',
  'bg-cyan-100 border-cyan-300 text-cyan-900'
]

// Map draw IDs to consistent colors
const DRAW_COLOR_MAP: Record<string, string> = {
  'd1': DRAW_COLORS[0], // Level 5 - Singles - Eliminatory (blue)
  'd2': DRAW_COLORS[1], // Level 6 - Singles - Eliminatory (purple)
  'd3': DRAW_COLORS[2], // Level 7 - Doubles - Groups (emerald)
  'd4': DRAW_COLORS[3], // Level 7 - Doubles - Groups (amber)
  'd5': DRAW_COLORS[4], // Level 6 - Doubles - Eliminatory (rose)
  'd6': DRAW_COLORS[5], // (indigo)
  'd7': DRAW_COLORS[6], // (teal)
  'd8': DRAW_COLORS[7], // (orange)
  'd9': DRAW_COLORS[8], // (yellow)
  'd10': DRAW_COLORS[9] // (cyan)
}

// Export function to get color for a draw
export const getDrawColor = (drawId: string): string => {
  return DRAW_COLOR_MAP[drawId] || DRAW_COLORS[8] // Default to yellow if not found
}

// Generate fully scheduled matches (for after wizard completion)
// Respecting court availability: Court 3 (unavailable until 14:00), Court 6 (unavailable 12:00-16:00)
const generateScheduledMatches = (): Match[] => [
  { id: 'm1', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p1', player1Name: 'John Smith', player2Id: 'p3', player2Name: 'Michael Brown', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-08-15', scheduledTime: '09:00', status: 'scheduled', estimatedDuration: 90, result: '', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm2', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p5', player1Name: 'David Wilson', player2Id: 'p7', player2Name: 'James Taylor', courtId: 'c2', courtName: 'Court 2', scheduledDate: '2024-08-15', scheduledTime: '09:00', status: 'scheduled', estimatedDuration: 90, result: '', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm3', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p9', player1Name: 'Robert Thomas', player2Id: 'p11', player2Name: 'Daniel Garcia', courtId: 'c3', courtName: 'Court 3', scheduledDate: '2024-08-15', scheduledTime: '14:00', status: 'in-progress', estimatedDuration: 90, result: '6-4, 3-2', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm4', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p13', player1Name: 'Christopher Lee', player2Id: 'p15', player2Name: 'Kevin Harris', courtId: 'c4', courtName: 'Indoor Court A', scheduledDate: '2024-08-15', scheduledTime: '10:30', status: 'scheduled', estimatedDuration: 90, result: '', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm5', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p2', player1Name: 'Emma Johnson', player2Id: 'p4', player2Name: 'Sarah Davis', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-08-15', scheduledTime: '11:00', status: 'scheduled', estimatedDuration: 90, result: '', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm6', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p6', player1Name: 'Lisa Miller', player2Id: 'p8', player2Name: 'Amanda Anderson', courtId: 'c2', courtName: 'Court 2', scheduledDate: '2024-08-15', scheduledTime: '11:00', status: 'scheduled', estimatedDuration: 90, result: '', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm7', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p10', player1Name: 'Jessica Martinez', player2Id: 'p12', player2Name: 'Ashley Rodriguez', courtId: 'c5', courtName: 'Indoor Court B', scheduledDate: '2024-08-15', scheduledTime: '13:00', status: 'completed', score: '6-4, 6-2', result: '6-4, 6-2', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm8', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p14', player1Name: 'Megan White', player2Id: 'p16', player2Name: 'Rachel Clark', courtId: 'c6', courtName: 'Practice Court', scheduledDate: '2024-08-15', scheduledTime: '16:30', status: 'scheduled', estimatedDuration: 90, result: '', createdAt: new Date(), updatedAt: new Date() },
  { id: 'm9', drawId: 'd3', drawName: 'Level 7 - Doubles - Groups', roundName: 'Group A', gameType: 'Doubles', player1Name: 'Smith/Brown', player2Name: 'Wilson/Taylor', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-08-15', scheduledTime: '15:00', status: 'scheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm10', drawId: 'd3', drawName: 'Level 7 - Doubles - Groups', roundName: 'Group B', gameType: 'Doubles', player1Name: 'Thomas/Garcia', player2Name: 'Lee/Harris', courtId: 'c2', courtName: 'Court 2', scheduledDate: '2024-08-15', scheduledTime: '15:00', status: 'scheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm11', drawId: 'd4', drawName: 'Level 7 - Doubles - Groups', roundName: 'Group A', gameType: 'Doubles', player1Name: 'Johnson/Davis', player2Name: 'Miller/Anderson', courtId: 'c3', courtName: 'Court 3', scheduledDate: '2024-08-16', scheduledTime: '09:00', status: 'scheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm12', drawId: 'd4', drawName: 'Level 7 - Doubles - Groups', roundName: 'Group B', gameType: 'Doubles', player1Name: 'Martinez/Rodriguez', player2Name: 'White/Clark', courtId: 'c4', courtName: 'Indoor Court A', scheduledDate: '2024-08-16', scheduledTime: '09:00', status: 'scheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm13', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Quarterfinals', gameType: 'Singles', player1Id: 'p1', player1Name: 'John Smith', player2Id: 'p9', player2Name: 'Robert Thomas', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-08-16', scheduledTime: '11:00', status: 'scheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm14', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Quarterfinals', gameType: 'Singles', player1Id: 'p5', player1Name: 'David Wilson', player2Id: 'p13', player2Name: 'Christopher Lee', courtId: 'c2', courtName: 'Court 2', scheduledDate: '2024-08-16', scheduledTime: '11:00', status: 'scheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm15', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Quarterfinals', gameType: 'Singles', player1Id: 'p2', player1Name: 'Emma Johnson', player2Id: 'p10', player2Name: 'Jessica Martinez', courtId: 'c3', courtName: 'Court 3', scheduledDate: '2024-08-16', scheduledTime: '13:00', status: 'scheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm16', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Quarterfinals', gameType: 'Singles', player1Id: 'p6', player1Name: 'Lisa Miller', player2Id: 'p14', player2Name: 'Megan White', courtId: 'c4', courtName: 'Indoor Court A', scheduledDate: '2024-08-16', scheduledTime: '13:00', status: 'scheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm17', drawId: 'd5', drawName: 'Level 6 - Doubles - Eliminatory', roundName: 'Final', gameType: 'Doubles', scheduledDate: '2024-08-17', scheduledTime: '14:00', status: 'scheduled', courtId: 'c1', courtName: 'Center Court', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm18', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Semi-finals', gameType: 'Singles', player1Name: 'TBD', player2Name: 'TBD', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-08-17', scheduledTime: '10:00', status: 'scheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm19', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Semi-finals', gameType: 'Singles', player1Name: 'TBD', player2Name: 'TBD', courtId: 'c2', courtName: 'Court 2', scheduledDate: '2024-08-17', scheduledTime: '12:00', status: 'scheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm20', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Finals', gameType: 'Singles', player1Name: 'TBD', player2Name: 'TBD', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-08-17', scheduledTime: '16:00', status: 'scheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() },
  
  // Additional matches for better court utilization on August 15th
  { id: 'm21', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p17', player1Name: 'Alex Martin', player2Id: 'p18', player2Name: 'Sam Chen', courtId: 'c5', courtName: 'Indoor Court B', scheduledDate: '2024-08-15', scheduledTime: '09:30', status: 'scheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm22', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p19', player1Name: 'Maria Lopez', player2Id: 'p20', player2Name: 'Jenny Park', courtId: 'c4', courtName: 'Indoor Court A', scheduledDate: '2024-08-15', scheduledTime: '12:30', status: 'scheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm23', drawId: 'd3', drawName: 'Level 7 - Doubles - Groups', roundName: 'Group A', gameType: 'Doubles', player1Name: 'Chen/Lopez', player2Name: 'Martin/Park', courtId: 'c5', courtName: 'Indoor Court B', scheduledDate: '2024-08-15', scheduledTime: '17:00', status: 'scheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm24', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p21', player1Name: 'Carlos Rivera', player2Id: 'p22', player2Name: 'Tom Wilson', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-08-15', scheduledTime: '13:30', status: 'completed', score: '7-5, 6-3', result: '7-5, 6-3', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm25', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p23', player1Name: 'Anna Schmidt', player2Id: 'p24', player2Name: 'Kate Brown', courtId: 'c2', courtName: 'Court 2', scheduledDate: '2024-08-15', scheduledTime: '17:30', status: 'scheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  
  // Additional matches for August 16th
  { id: 'm26', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Semi-finals', gameType: 'Singles', player1Name: 'TBD', player2Name: 'TBD', courtId: 'c5', courtName: 'Indoor Court B', scheduledDate: '2024-08-16', scheduledTime: '09:00', status: 'scheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm27', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Semi-finals', gameType: 'Singles', player1Name: 'TBD', player2Name: 'TBD', courtId: 'c6', courtName: 'Practice Court', scheduledDate: '2024-08-16', scheduledTime: '09:00', status: 'scheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm28', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Finals', gameType: 'Singles', player1Name: 'TBD', player2Name: 'TBD', courtId: 'c1', courtName: 'Center Court', scheduledDate: '2024-08-16', scheduledTime: '15:00', status: 'scheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm29', drawId: 'd3', drawName: 'Level 7 - Doubles - Groups', roundName: 'Semi-finals', gameType: 'Doubles', player1Name: 'TBD/TBD', player2Name: 'TBD/TBD', courtId: 'c2', courtName: 'Court 2', scheduledDate: '2024-08-16', scheduledTime: '16:00', status: 'scheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm30', drawId: 'd3', drawName: 'Level 7 - Doubles - Groups', roundName: 'Semi-finals', gameType: 'Doubles', player1Name: 'TBD/TBD', player2Name: 'TBD/TBD', courtId: 'c3', courtName: 'Court 3', scheduledDate: '2024-08-16', scheduledTime: '16:00', status: 'scheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() }
]

// Generate fresh/unscheduled matches (for fresh tournament)
const generateUnscheduledMatches = (): Match[] => [
  { id: 'm1', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p1', player1Name: 'John Smith', player2Id: 'p3', player2Name: 'Michael Brown', status: 'unscheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm2', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p5', player1Name: 'David Wilson', player2Id: 'p7', player2Name: 'James Taylor', status: 'unscheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm3', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p9', player1Name: 'Robert Thomas', player2Id: 'p11', player2Name: 'Daniel Garcia', status: 'unscheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm4', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p13', player1Name: 'Christopher Lee', player2Id: 'p15', player2Name: 'Kevin Harris', status: 'unscheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm5', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p2', player1Name: 'Emma Johnson', player2Id: 'p4', player2Name: 'Sarah Davis', status: 'unscheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm6', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p6', player1Name: 'Lisa Miller', player2Id: 'p8', player2Name: 'Amanda Anderson', status: 'unscheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm7', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p10', player1Name: 'Jessica Martinez', player2Id: 'p12', player2Name: 'Ashley Rodriguez', status: 'unscheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm8', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Qualifiers', gameType: 'Singles', player1Id: 'p14', player1Name: 'Megan White', player2Id: 'p16', player2Name: 'Rachel Clark', status: 'unscheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm9', drawId: 'd3', drawName: 'Level 7 - Doubles - Groups', roundName: 'Group A', gameType: 'Doubles', player1Name: 'Smith/Brown', player2Name: 'Wilson/Taylor', status: 'unscheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm10', drawId: 'd3', drawName: 'Level 7 - Doubles - Groups', roundName: 'Group B', gameType: 'Doubles', player1Name: 'Thomas/Garcia', player2Name: 'Lee/Harris', status: 'unscheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm11', drawId: 'd4', drawName: 'Level 7 - Doubles - Groups', roundName: 'Group A', gameType: 'Doubles', player1Name: 'Johnson/Davis', player2Name: 'Miller/Anderson', status: 'unscheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm12', drawId: 'd4', drawName: 'Level 7 - Doubles - Groups', roundName: 'Group B', gameType: 'Doubles', player1Name: 'Martinez/Rodriguez', player2Name: 'White/Clark', status: 'unscheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm13', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Quarterfinals', gameType: 'Singles', status: 'unscheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm14', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Quarterfinals', gameType: 'Singles', status: 'unscheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm15', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Quarterfinals', gameType: 'Singles', status: 'unscheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm16', drawId: 'd2', drawName: 'Level 6 - Singles - Eliminatory', roundName: 'Quarterfinals', gameType: 'Singles', status: 'unscheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm17', drawId: 'd5', drawName: 'Level 6 - Doubles - Eliminatory', roundName: 'Final', gameType: 'Doubles', status: 'unscheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm18', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Semifinals', gameType: 'Singles', status: 'unscheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm19', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Semifinals', gameType: 'Singles', status: 'unscheduled', estimatedDuration: 90, createdAt: new Date(), updatedAt: new Date() },
  { id: 'm20', drawId: 'd1', drawName: 'Level 5 - Singles - Eliminatory', roundName: 'Final', gameType: 'Singles', status: 'unscheduled', estimatedDuration: 120, createdAt: new Date(), updatedAt: new Date() }
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
    { id: 'd1', name: 'Level 5 - Singles - Eliminatory', level: 5, drawModel: 'Eliminatory', restrictions: ['Age over 18'], format: 'single-elimination', category: 'mens-singles', maxPlayers: 32, currentPlayers: 28, status: 'in-progress', prizeMoney: 10000, entryCost: 50 },
    { id: 'd2', name: 'Level 6 - Singles - Eliminatory', level: 6, drawModel: 'Eliminatory', restrictions: ['Premium accounts only'], format: 'single-elimination', category: 'womens-singles', maxPlayers: 32, currentPlayers: 24, status: 'in-progress', prizeMoney: 10000, entryCost: 50 },
    { id: 'd3', name: 'Level 7 - Doubles - Groups', level: 7, drawModel: 'Groups', restrictions: ['Age over 18'], format: 'round-robin', category: 'mens-doubles', maxPlayers: 16, currentPlayers: 14, status: 'in-progress', prizeMoney: 6000, entryCost: 80 },
    { id: 'd4', name: 'Level 7 - Doubles - Groups', level: 7, drawModel: 'Groups', restrictions: ['Premium accounts only'], format: 'round-robin', category: 'womens-doubles', maxPlayers: 16, currentPlayers: 12, status: 'in-progress', prizeMoney: 6000, entryCost: 80 },
    { id: 'd5', name: 'Level 6 - Doubles - Eliminatory', level: 6, drawModel: 'Eliminatory', restrictions: ['Age over 18', 'Premium accounts only'], format: 'single-elimination', category: 'mixed-doubles', maxPlayers: 16, currentPlayers: 10, status: 'open', prizeMoney: 4000, entryCost: 60 }
  ]

  // Generate initial demo logs
  const logs = [
    {
      id: 'log_init_1',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      actionType: 'schedule_generated' as const,
      severity: 'success' as const,
      title: 'Initial Schedule Generated',
      description: 'Tournament schedule created with 20 matches across 6 courts',
      details: {
        metadata: {
          totalMatches: 20,
          scheduledMatches: 0,
          courtsUsed: 6
        }
      }
    },
    {
      id: 'log_init_2',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      actionType: 'configuration_changed' as const,
      severity: 'info' as const,
      title: 'Configuration Updated',
      description: 'Match duration changed from 90 to 60 minutes',
      details: {
        before: { defaultMatchDuration: 90 },
        after: { defaultMatchDuration: 60 }
      }
    },
    {
      id: 'log_init_3',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      actionType: 'court_modified' as const,
      severity: 'warning' as const,
      title: 'Court Status Changed',
      description: 'Court 3 marked as unavailable for maintenance',
      details: {
        courtId: 'c3',
        before: { available: true },
        after: { available: false }
      }
    }
  ]

  return {
    players,
    courts,
    matches,
    blockers,
    draws,
    logs,
    selectedMatch: null,
    conflicts: [],
    currentView: 'grid',
    selectedDate: '2024-08-15',
    loading: false,
    error: null,
    lastRefreshTime: null,
    scheduleStatus: 'private',
    lastPublishedAt: null
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
    
    case 'UPDATE_MATCH': {
      const match = state.matches.find(m => m.id === action.payload.matchId)
      const updatedMatch = match ? { ...match, ...action.payload.updates, updatedAt: new Date() } : null
      
      // Determine log type based on what was updated
      let logType: TournamentAction['type'] = 'UPDATE_MATCH'
      let logTitle = 'Match Updated'
      let logDescription = ''
      
      if (action.payload.updates.score && action.payload.updates.score !== match?.score) {
        logType = 'UPDATE_MATCH'
        logTitle = 'Score Entered'
        logDescription = `Score updated for ${match?.player1Name} vs ${match?.player2Name}: ${action.payload.updates.score}`
      } else if (action.payload.updates.scheduledTime || action.payload.updates.courtId) {
        logType = 'UPDATE_MATCH'
        logTitle = 'Match Rescheduled'
        logDescription = `Match ${match?.player1Name} vs ${match?.player2Name} moved to ${action.payload.updates.courtName || match?.courtName} at ${action.payload.updates.scheduledTime || match?.scheduledTime}`
      } else if (action.payload.updates.status) {
        logType = 'UPDATE_MATCH'
        logTitle = 'Match Status Changed'
        logDescription = `Status changed from ${match?.status} to ${action.payload.updates.status}`
      }
      
      // Create log entry
      const logEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        actionType: action.payload.updates.score ? 'match_score_entered' as const : 
                   (action.payload.updates.scheduledTime || action.payload.updates.courtId) ? 'match_rescheduled' as const : 
                   'match_status_changed' as const,
        severity: 'info' as const,
        title: logTitle,
        description: logDescription,
        details: {
          matchId: action.payload.matchId,
          courtId: action.payload.updates.courtId || match?.courtId,
          before: match ? {
            score: match.score,
            scheduledTime: match.scheduledTime,
            courtId: match.courtId,
            status: match.status
          } : null,
          after: action.payload.updates
        }
      }
      
      return {
        ...state,
        matches: state.matches.map(m => 
          m.id === action.payload.matchId ? updatedMatch! : m
        ),
        logs: [logEntry, ...state.logs]
      }
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
    
    case 'APPLY_SCHEDULE': {
      const scheduledCount = action.payload.filter(m => m.scheduledTime && m.scheduledDate).length
      const logEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        actionType: 'schedule_generated' as const,
        severity: 'success' as const,
        title: 'Schedule Generated Successfully',
        description: `${scheduledCount} matches scheduled across ${state.courts.length} courts`,
        details: {
          metadata: {
            totalMatches: action.payload.length,
            scheduledMatches: scheduledCount,
            courtsUsed: state.courts.length
          }
        }
      }
      
      return {
        ...state,
        matches: action.payload,
        logs: [logEntry, ...state.logs]
      }
    }
    
    case 'RESET_SCHEDULE':
      // Create fresh unscheduled matches to avoid reference issues
      const freshMatches = generateUnscheduledMatches()
      return { ...state, matches: freshMatches }
    
    case 'SET_LAST_REFRESH_TIME':
      return { ...state, lastRefreshTime: action.payload }
    
    case 'TOGGLE_SCHEDULE_STATUS': {
      const newStatus = state.scheduleStatus === 'private' ? 'published' : 'private'
      const logEntry = {
        id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date(),
        actionType: newStatus === 'published' ? 'schedule_published' as const : 'schedule_unpublished' as const,
        severity: 'success' as const,
        title: newStatus === 'published' ? 'Schedule Published' : 'Schedule Set to Private',
        description: newStatus === 'published' 
          ? 'Tournament schedule is now publicly visible'
          : 'Tournament schedule is now private',
        details: {
          before: { status: state.scheduleStatus },
          after: { status: newStatus }
        }
      }
      
      return {
        ...state,
        scheduleStatus: newStatus,
        lastPublishedAt: newStatus === 'published' ? new Date() : state.lastPublishedAt,
        logs: [logEntry, ...state.logs]
      }
    }
    
    case 'ADD_LOG':
      return {
        ...state,
        logs: [{
          id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: new Date(),
          ...action.payload
        }, ...state.logs]
      }
    
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

  const setLastRefreshTime = (time: Date) => {
    dispatch({ type: 'SET_LAST_REFRESH_TIME', payload: time })
  }
  
  const toggleScheduleStatus = () => {
    dispatch({ type: 'TOGGLE_SCHEDULE_STATUS' })
  }

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
    resetSchedule,
    setLastRefreshTime,
    toggleScheduleStatus
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