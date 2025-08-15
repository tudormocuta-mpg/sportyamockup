import React from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Player } from '../../types/tournament'
import { XMarkIcon, EnvelopeIcon, PhoneIcon, TrophyIcon, ChartBarIcon, ClockIcon, CalendarIcon } from '@heroicons/react/24/outline'

interface PlayerDetailsCardProps {
  playerId: string
  onClose: () => void
}

const PlayerDetailsCard: React.FC<PlayerDetailsCardProps> = ({ playerId, onClose }) => {
  const { state } = useTournament()
  
  // Find player
  const player = state.players.find(p => p.id === playerId)
  if (!player) return null

  // Get player's matches in this tournament
  const playerMatches = state.matches.filter(match => 
    match.player1Id === playerId || match.player2Id === playerId ||
    match.player1Name?.includes(player.lastName) || match.player2Name?.includes(player.lastName)
  )

  const currentMatches = playerMatches.filter(m => m.status === 'in-progress')
  const upcomingMatches = playerMatches.filter(m => m.status === 'scheduled')
  const completedMatches = playerMatches.filter(m => m.status === 'completed')
  
  // Get opponents faced
  const opponentsFaced = new Set<string>()
  playerMatches.forEach(match => {
    if (match.status === 'completed') {
      if (match.player1Id === playerId && match.player2Name) {
        opponentsFaced.add(match.player2Name)
      } else if (match.player2Id === playerId && match.player1Name) {
        opponentsFaced.add(match.player1Name)
      }
    }
  })

  // Mock performance stats (would come from API in production)
  const performanceStats = {
    tournamentsPlayed: Math.floor(Math.random() * 20) + 5,
    matchesWon: Math.floor(Math.random() * 30) + 10,
    matchesLost: Math.floor(Math.random() * 20) + 5,
    nationalRanking: Math.floor(Math.random() * 100) + 1,
    regionalRanking: Math.floor(Math.random() * 50) + 1
  }

  // Mock availability (would come from player preferences in production)
  const availability = {
    morning: Math.random() > 0.5,
    daytime: Math.random() > 0.3,
    evening: Math.random() > 0.4,
    restTimeRequired: '60 min',
    fatigueLevel: Math.random() > 0.6 ? 'High' : Math.random() > 0.3 ? 'Medium' : 'Low'
  }

  const getFatigueColor = (level: string) => {
    switch(level) {
      case 'Low': return 'text-green-600 bg-green-50'
      case 'Medium': return 'text-yellow-600 bg-yellow-50'
      case 'High': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="w-96 bg-white border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold">{player.firstName} {player.lastName}</h2>
            <p className="text-blue-100 mt-1">Player Profile</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Sportya Levels */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-xs text-blue-100">Singles Level</div>
            <div className="text-2xl font-bold">{player.sportyaLevelSingles}</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3">
            <div className="text-xs text-blue-100">Doubles Level</div>
            <div className="text-2xl font-bold">{player.sportyaLevelDoubles}</div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Contact Information */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div className="space-y-2">
            <div className="flex items-center text-sm">
              <EnvelopeIcon className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-600">{player.email}</span>
            </div>
            <div className="flex items-center text-sm">
              <PhoneIcon className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-600">{player.phone || '+1 (555) 123-4567'}</span>
            </div>
            <div className="flex items-center text-sm">
              <CalendarIcon className="w-4 h-4 text-gray-400 mr-2" />
              <span className="text-gray-600">Joined: {player.joinedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Tournament Activity */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Tournament Activity</h3>
          
          {/* Current Matches */}
          {currentMatches.length > 0 && (
            <div className="mb-3">
              <div className="text-xs font-medium text-gray-500 mb-1">Current Matches</div>
              {currentMatches.map(match => (
                <div key={match.id} className="bg-green-50 border border-green-200 rounded-lg p-2 mb-2">
                  <div className="text-sm font-medium text-gray-900">
                    {match.player1Name} vs {match.player2Name}
                  </div>
                  <div className="text-xs text-gray-600">
                    {match.courtName} • {match.score || 'In progress'}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upcoming Matches */}
          <div className="mb-3">
            <div className="text-xs font-medium text-gray-500 mb-1">Upcoming Matches ({upcomingMatches.length})</div>
            {upcomingMatches.slice(0, 3).map(match => (
              <div key={match.id} className="bg-gray-50 rounded-lg p-2 mb-2">
                <div className="text-sm font-medium text-gray-900">
                  {match.player1Name || 'TBD'} vs {match.player2Name || 'TBD'}
                </div>
                <div className="text-xs text-gray-600">
                  {match.scheduledDate && new Date(match.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                  {match.scheduledTime && ` • ${match.scheduledTime}`}
                  {match.courtName && ` • ${match.courtName}`}
                </div>
              </div>
            ))}
          </div>

          {/* Opponents Faced */}
          <div>
            <div className="text-xs font-medium text-gray-500 mb-1">Opponents Faced</div>
            <div className="flex flex-wrap gap-1">
              {Array.from(opponentsFaced).map(opponent => (
                <span key={opponent} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {opponent}
                </span>
              ))}
              {opponentsFaced.size === 0 && (
                <span className="text-xs text-gray-500">No completed matches yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="p-4 border-b">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Performance Stats (Last 52 weeks)</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Tournaments</div>
              <div className="text-lg font-bold text-gray-900">{performanceStats.tournamentsPlayed}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Win/Loss</div>
              <div className="text-lg font-bold text-gray-900">
                {performanceStats.matchesWon}-{performanceStats.matchesLost}
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">National Rank</div>
              <div className="text-lg font-bold text-gray-900">#{performanceStats.nationalRanking}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500">Regional Rank</div>
              <div className="text-lg font-bold text-gray-900">#{performanceStats.regionalRanking}</div>
            </div>
          </div>
        </div>

        {/* Scheduling Constraints */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Scheduling Constraints</h3>
          
          {/* Availability Windows */}
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-500 mb-2">Availability Windows</div>
            <div className="grid grid-cols-3 gap-2">
              <div className={`text-center p-2 rounded-lg border ${
                availability.morning ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                <div className="text-xs">Morning</div>
                <div className="text-xs">(6am-12pm)</div>
              </div>
              <div className={`text-center p-2 rounded-lg border ${
                availability.daytime ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                <div className="text-xs">Daytime</div>
                <div className="text-xs">(12pm-6pm)</div>
              </div>
              <div className={`text-center p-2 rounded-lg border ${
                availability.evening ? 'bg-green-50 border-green-200 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}>
                <div className="text-xs">Evening</div>
                <div className="text-xs">(6pm-10pm)</div>
              </div>
            </div>
          </div>

          {/* Rest Time & Fatigue */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Rest Time Required</div>
              <div className="text-sm font-semibold text-gray-900">{availability.restTimeRequired}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Fatigue Level</div>
              <div className={`text-sm font-semibold px-2 py-1 rounded ${getFatigueColor(availability.fatigueLevel)}`}>
                {availability.fatigueLevel}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t p-4 bg-gray-50">
        <div className="grid grid-cols-2 gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium">
            View Full Profile
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors font-medium">
            Match History
          </button>
        </div>
      </div>
    </div>
  )
}

export default PlayerDetailsCard