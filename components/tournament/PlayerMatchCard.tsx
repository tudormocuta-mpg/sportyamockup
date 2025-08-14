import React from 'react'
import { useTournament } from '../../contexts/TournamentContext'

interface PlayerMatchCardProps {
  playerId: string
}

const PlayerMatchCard: React.FC<PlayerMatchCardProps> = ({ playerId }) => {
  const { state } = useTournament()
  
  // Find the player
  const player = state.players.find(p => p.id === playerId)
  
  if (!player) {
    return (
      <div className="p-4 text-center text-gray-500">
        Player not found
      </div>
    )
  }

  // Get player matches
  const playerMatches = state.matches.filter(match => 
    match.player1Id === playerId || match.player2Id === playerId
  )

  // Calculate stats
  const totalMatches = playerMatches.length
  const completedMatches = playerMatches.filter(match => match.status === 'completed')
  const wonMatches = completedMatches.filter(match => {
    // Simple win calculation - this would be more sophisticated in real app
    if (match.score && match.player1Id === playerId) {
      return match.score.includes('6-') && !match.score.includes('0-6')
    }
    return false
  })

  const winPercentage = completedMatches.length > 0 
    ? Math.round((wonMatches.length / completedMatches.length) * 100)
    : 0

  // Mock availability data
  const availability = {
    day1: ['morning', 'daytime'],
    day2: ['daytime', 'evening'],
    day3: ['morning', 'evening'],
    day4: ['daytime'],
    day5: ['morning', 'daytime', 'evening'],
    day6: ['daytime', 'evening'],
    day7: ['morning']
  }

  // Mock recent tournaments
  const recentTournaments = [
    { name: 'Spring Championship', date: '2024-07-15', result: 'Semifinal', prize: '$250' },
    { name: 'Summer Cup', date: '2024-06-20', result: 'Final', prize: '$500' },
    { name: 'Club Tournament', date: '2024-06-01', result: 'Quarterfinal', prize: '$100' },
    { name: 'Regional Open', date: '2024-05-15', result: 'Round 16', prize: '$50' }
  ]

  const formatAvailabilityPeriod = (period: string): string => {
    switch (period) {
      case 'morning': return 'Morning (up to 11:00)'
      case 'daytime': return 'Daytime (11:00-17:00)'
      case 'evening': return 'Evening (after 17:00)'
      default: return period
    }
  }

  const getOpponent = (match: any): string => {
    if (match.player1Id === playerId) {
      return match.player2Name || 'TBD'
    } else {
      return match.player1Name || 'TBD'
    }
  }

  return (
    <div className="player-card p-4 space-y-6">
      {/* Player Header */}
      <div className="text-center pb-4 border-b border-gray-200">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-3 flex items-center justify-center text-white text-xl font-bold">
          {player.firstName[0]}{player.lastName[0]}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">
          {player.firstName} {player.lastName}
        </h3>
        <div className="text-sm text-gray-600 space-y-1 mt-2">
          <div>Singles Level: <span className="font-medium text-blue-600">{player.sportyaLevelSingles}</span></div>
          <div>Doubles Level: <span className="font-medium text-blue-600">{player.sportyaLevelDoubles}</span></div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <span className="w-12 text-gray-500">Email:</span>
            <span className="text-gray-900">{player.email}</span>
          </div>
          <div className="flex items-center">
            <span className="w-12 text-gray-500">Phone:</span>
            <span className="text-gray-900">{player.phone || 'Not provided'}</span>
          </div>
          <div className="flex items-center">
            <span className="w-12 text-gray-500">Joined:</span>
            <span className="text-gray-900">{player.joinedDate.toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Performance Stats */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Tournament Performance</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-900">{totalMatches}</div>
            <div className="text-xs text-gray-600">Total Matches</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{winPercentage}%</div>
            <div className="text-xs text-gray-600">Win Rate</div>
          </div>
        </div>
        
        <div className="mt-3 text-xs text-gray-600 space-y-1">
          <div>Completed: <span className="font-medium">{completedMatches.length}</span></div>
          <div>Won: <span className="font-medium text-green-600">{wonMatches.length}</span></div>
          <div>Lost: <span className="font-medium text-red-600">{completedMatches.length - wonMatches.length}</span></div>
        </div>
      </div>

      {/* Current Tournament Matches */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Current Tournament Matches</h4>
        <div className="space-y-3">
          {playerMatches.slice(0, 5).map(match => (
            <div key={match.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-gray-900">{match.drawName}</div>
                  <div className="text-xs text-gray-600">{match.roundName}</div>
                  <div className="text-xs text-gray-800 mt-1">
                    vs {getOpponent(match)}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-xs px-2 py-1 rounded ${
                    match.status === 'completed' ? 'bg-green-100 text-green-800' :
                    match.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {match.status.replace('-', ' ')}
                  </div>
                  {match.scheduledTime && (
                    <div className="text-xs text-gray-600 mt-1">{match.scheduledTime}</div>
                  )}
                </div>
              </div>
              {match.score && (
                <div className="text-xs text-gray-900 mt-2 font-mono">
                  Score: {match.score}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Availability Preferences */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Weekly Availability</h4>
        <div className="space-y-2">
          {Object.entries(availability).map(([day, periods], index) => (
            <div key={day} className="flex justify-between items-center text-xs">
              <span className="font-medium text-gray-700 w-16">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
              </span>
              <div className="flex space-x-1">
                {(['morning', 'daytime', 'evening'] as const).map(period => (
                  <div
                    key={period}
                    className={`w-3 h-3 rounded-full ${
                      periods.includes(period) 
                        ? 'bg-green-500' 
                        : 'bg-gray-200'
                    }`}
                    title={formatAvailabilityPeriod(period)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-3 text-xs text-gray-500 space-y-1">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Available
          </div>
          <div>Morning: up to 11:00 | Daytime: 11:00-17:00 | Evening: after 17:00</div>
        </div>
      </div>

      {/* Recent Tournament History */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Tournament History</h4>
        <div className="space-y-3">
          {recentTournaments.map((tournament, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm font-medium text-gray-900">{tournament.name}</div>
                  <div className="text-xs text-gray-600">{new Date(tournament.date).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-900">{tournament.result}</div>
                  <div className="text-xs text-green-600">{tournament.prize}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Notes</h4>
        <div className="bg-gray-50 rounded-lg p-3">
          <textarea
            placeholder="Add notes about this player..."
            rows={3}
            className="w-full text-xs bg-transparent border-none resize-none focus:outline-none text-gray-700"
            defaultValue={player.notes || ''}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-2">
          <button className="px-3 py-2 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors">
            Message Player
          </button>
          <button className="px-3 py-2 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors">
            View All Matches
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlayerMatchCard