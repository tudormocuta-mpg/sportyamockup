import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { UserIcon, PhoneIcon, EnvelopeIcon, CalendarDaysIcon, TrophyIcon, ChartBarIcon, ClockIcon, MapPinIcon, CheckCircleIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'

interface PlayerMatchCardProps {
  playerId: string
}

const PlayerMatchCard: React.FC<PlayerMatchCardProps> = ({ playerId }) => {
  const { state } = useTournament()
  const [activeTab, setActiveTab] = useState<'overview' | 'matches' | 'statistics' | 'schedule'>('overview')
  
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Contact Information */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <UserIcon className="w-4 h-4 mr-2 text-blue-600" />
                Contact Information
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center bg-gray-50 rounded-lg p-3">
                  <EnvelopeIcon className="w-4 h-4 text-gray-500 mr-3" />
                  <span className="text-gray-900 font-medium">{player.email}</span>
                </div>
                <div className="flex items-center bg-gray-50 rounded-lg p-3">
                  <PhoneIcon className="w-4 h-4 text-gray-500 mr-3" />
                  <span className="text-gray-900 font-medium">{player.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center bg-gray-50 rounded-lg p-3">
                  <CalendarDaysIcon className="w-4 h-4 text-gray-500 mr-3" />
                  <span className="text-gray-900 font-medium">Joined {player.joinedDate.toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
                <ChartBarIcon className="w-4 h-4 mr-2 text-green-600" />
                Quick Statistics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">{totalMatches}</div>
                  <div className="text-xs text-blue-800 font-medium">Total Matches</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center border border-green-200">
                  <div className="text-2xl font-bold text-green-600">{winPercentage}%</div>
                  <div className="text-xs text-green-800 font-medium">Win Rate</div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Notes</h4>
              <div className="bg-gray-50 rounded-lg p-3">
                <textarea
                  placeholder="Add notes about this player..."
                  rows={3}
                  className="w-full text-xs bg-transparent border-none resize-none focus:outline-none text-gray-700"
                  defaultValue={player.notes || ''}
                />
              </div>
            </div>
          </div>
        )
      
      case 'matches':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-gray-900 flex items-center">
              <TrophyIcon className="w-4 h-4 mr-2 text-yellow-600" />
              Current Tournament Matches
            </h4>
            <div className="space-y-3 max-h-80 overflow-y-auto custom-scrollbar">
              {playerMatches.map(match => (
                <div key={match.id} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="text-sm font-bold text-gray-900 flex items-center">
                        <TrophyIcon className="w-3 h-3 mr-1 text-yellow-500" />
                        {match.drawName}
                      </div>
                      <div className="text-xs text-gray-600 font-medium">{match.roundName}</div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded-full font-bold flex items-center ${
                      match.status === 'completed' ? 'bg-green-100 text-green-800' :
                      match.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {match.status === 'in-progress' && <PlayIcon className="w-3 h-3 mr-1 animate-pulse" />}
                      {match.status === 'completed' && <CheckCircleIcon className="w-3 h-3 mr-1" />}
                      {match.status.replace('-', ' ')}
                    </div>
                  </div>
                  <div className="text-xs text-gray-800 mb-2 font-medium">
                    vs {getOpponent(match)}
                  </div>
                  <div className="flex justify-between items-center">
                    {match.scheduledTime && (
                      <div className="flex items-center text-xs text-gray-600">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        {match.scheduledTime}
                      </div>
                    )}
                    {match.courtName && (
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPinIcon className="w-3 h-3 mr-1" />
                        {match.courtName}
                      </div>
                    )}
                  </div>
                  {match.score && (
                    <div className="text-xs text-gray-900 mt-2 font-mono bg-white px-2 py-1 rounded border">
                      Score: {match.score}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'statistics':
        return (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-gray-900 flex items-center">
              <ChartBarIcon className="w-4 h-4 mr-2 text-purple-600" />
              Performance Statistics
            </h4>
            
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 text-center border border-blue-200">
                <div className="text-lg font-bold text-blue-600">{completedMatches.length}</div>
                <div className="text-xs text-blue-800 font-medium">Completed</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 text-center border border-green-200">
                <div className="text-lg font-bold text-green-600">{wonMatches.length}</div>
                <div className="text-xs text-green-800 font-medium">Won</div>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-3 text-center border border-red-200">
                <div className="text-lg font-bold text-red-600">{completedMatches.length - wonMatches.length}</div>
                <div className="text-xs text-red-800 font-medium">Lost</div>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-gray-900 mb-3">Recent Tournament History</h5>
              <div className="space-y-3">
                {recentTournaments.map((tournament, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-sm font-bold text-gray-900">{tournament.name}</div>
                        <div className="text-xs text-gray-600">{new Date(tournament.date).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-gray-900">{tournament.result}</div>
                        <div className="text-xs text-green-600 font-bold">{tournament.prize}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      
      case 'schedule':
        return (
          <div className="space-y-6">
            <h4 className="text-sm font-bold text-gray-900 flex items-center">
              <CalendarDaysIcon className="w-4 h-4 mr-2 text-indigo-600" />
              Weekly Availability
            </h4>
            
            <div className="space-y-3">
              {Object.entries(availability).map(([day, periods], index) => (
                <div key={day} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-700 text-sm">
                      {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index]}
                    </span>
                    <div className="flex space-x-2">
                      {(['morning', 'daytime', 'evening'] as const).map(period => (
                        <div
                          key={period}
                          className={`w-4 h-4 rounded-full border-2 ${
                            periods.includes(period) 
                              ? 'bg-green-500 border-green-600' 
                              : 'bg-gray-200 border-gray-300'
                          }`}
                          title={formatAvailabilityPeriod(period)}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {periods.map(formatAvailabilityPeriod).join(', ')}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <div className="text-xs text-blue-800 font-bold mb-2">Legend:</div>
              <div className="text-xs text-blue-700 space-y-1">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Available
                </div>
                <div>Morning: up to 11:00 | Daytime: 11:00-17:00 | Evening: after 17:00</div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="player-card bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      {/* Enhanced Player Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-white text-xl font-bold backdrop-blur-sm">
            {player.firstName[0]}{player.lastName[0]}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold">
              {player.firstName} {player.lastName}
            </h3>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                Singles: <span className="font-bold">{player.sportyaLevelSingles}</span>
              </div>
              <div className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                Doubles: <span className="font-bold">{player.sportyaLevelDoubles}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tab Navigation */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
        <div className="flex">
          {[
            { id: 'overview', label: 'Overview', icon: UserIcon },
            { id: 'matches', label: 'Matches', icon: TrophyIcon },
            { id: 'statistics', label: 'Stats', icon: ChartBarIcon },
            { id: 'schedule', label: 'Schedule', icon: CalendarDaysIcon }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-4 py-3 text-xs font-bold flex items-center justify-center space-x-1 transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 border-b-2 border-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
        {renderTabContent()}
      </div>

      {/* Enhanced Quick Actions */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-3">
          <button className="px-4 py-3 text-xs bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-bold flex items-center justify-center space-x-1 shadow-sm hover:shadow-md">
            <EnvelopeIcon className="w-3 h-3" />
            <span>Message</span>
          </button>
          <button className="px-4 py-3 text-xs bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-lg hover:from-gray-300 hover:to-gray-400 transition-all duration-200 font-bold flex items-center justify-center space-x-1 shadow-sm hover:shadow-md">
            <TrophyIcon className="w-3 h-3" />
            <span>All Matches</span>
          </button>
        </div>
      </div>

    </div>
  )
}

export default PlayerMatchCard