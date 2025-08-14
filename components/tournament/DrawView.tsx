import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { TrophyIcon, UsersIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline'

const DrawView: React.FC = () => {
  const { state, setSelectedMatch } = useTournament()
  const [selectedDraw, setSelectedDraw] = useState<string>(state.draws[0]?.id || '')

  // Get current draw
  const currentDraw = state.draws.find(d => d.id === selectedDraw)
  
  // Get matches for current draw
  const drawMatches = state.matches.filter(match => match.drawId === selectedDraw)
  
  // Group matches by round
  const matchesByRound = drawMatches.reduce((acc, match) => {
    const round = match.roundName || 'Unknown Round'
    if (!acc[round]) acc[round] = []
    acc[round].push(match)
    return acc
  }, {} as Record<string, typeof drawMatches>)

  // Define round order for tournament progression
  const getRoundOrder = (format: string) => {
    if (format === 'single-elimination') {
      return ['First Round', 'Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final']
    } else if (format === 'double-elimination') {
      return ['First Round', 'Round of 32', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Winners Final', 'Losers Final', 'Grand Final']
    } else {
      return ['Group Stage', 'Round of 16', 'Quarterfinals', 'Semifinals', 'Final']
    }
  }

  const roundOrder = currentDraw ? getRoundOrder(currentDraw.format) : []
  const displayRounds = roundOrder.filter(round => matchesByRound[round])

  // Format player names for display
  const formatPlayers = (match: any): string => {
    if (match.player1Name && match.player2Name) {
      return `${match.player1Name} vs ${match.player2Name}`
    } else if (match.player1Name) {
      return `${match.player1Name} vs TBD`
    } else if (match.player2Name) {
      return `TBD vs ${match.player2Name}`
    }
    return 'TBD vs TBD'
  }

  // Get match status color
  const getMatchStatusColor = (status: string): string => {
    switch (status) {
      case 'scheduled': return 'border-blue-300 bg-blue-50'
      case 'in-progress': return 'border-green-300 bg-green-50'
      case 'completed': return 'border-gray-300 bg-gray-50'
      case 'postponed': return 'border-yellow-300 bg-yellow-50'
      default: return 'border-gray-300 bg-gray-50'
    }
  }

  // Get draw completion percentage
  const getDrawProgress = () => {
    if (!drawMatches.length) return 0
    const completedMatches = drawMatches.filter(m => m.status === 'completed').length
    return Math.round((completedMatches / drawMatches.length) * 100)
  }

  if (!currentDraw) {
    return (
      <div className="draw-view h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-lg font-medium mb-2">No draws available</div>
          <div className="text-sm">Create a draw to view the bracket structure</div>
        </div>
      </div>
    )
  }

  return (
    <div className="draw-view h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Enhanced Draw Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <div className="flex justify-between items-start">
            <div className="text-white">
              <div className="flex items-center space-x-4 mb-4">
                <select
                  value={selectedDraw}
                  onChange={(e) => setSelectedDraw(e.target.value)}
                  className="px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-white shadow-sm font-medium"
                >
                  {state.draws.map(draw => (
                    <option key={draw.id} value={draw.id}>
                      {draw.name} ({draw.format.replace('-', ' ')})
                    </option>
                  ))}
                </select>
                
                <div className={`px-4 py-2 rounded-lg text-sm font-bold shadow-sm ${
                  currentDraw.status === 'completed' ? 'bg-green-500 text-white' :
                  currentDraw.status === 'in-progress' ? 'bg-yellow-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {currentDraw.status.replace('-', ' ').toUpperCase()}
                </div>
              </div>

              <h2 className="text-3xl font-bold mb-3 flex items-center">
                <TrophyIcon className="w-8 h-8 mr-3 text-yellow-300" />
                {currentDraw.name}
              </h2>
              <div className="grid grid-cols-3 gap-6 text-sm">
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="font-semibold text-white/80">Format</div>
                  <div className="font-bold text-lg">{currentDraw.format.replace('-', ' ')}</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="font-semibold text-white/80">Category</div>
                  <div className="font-bold text-lg">{currentDraw.category.replace('-', ' ')}</div>
                </div>
                <div className="bg-white/20 rounded-lg p-3">
                  <div className="font-semibold text-white/80 flex items-center">
                    <UsersIcon className="w-4 h-4 mr-1" />
                    Players
                  </div>
                  <div className="font-bold text-lg">{currentDraw.currentPlayers} / {currentDraw.maxPlayers}</div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="bg-white/20 rounded-lg p-6 backdrop-blur-sm">
                <div className="text-4xl font-bold text-white mb-1">{getDrawProgress()}%</div>
                <div className="text-sm text-white/80 font-medium mb-3">Tournament Complete</div>
                <div className="w-32 bg-white/30 rounded-full h-3">
                  <div 
                    className="bg-yellow-400 h-3 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${getDrawProgress()}%` }}
                  ></div>
                </div>
                <div className="text-xs text-white/70 mt-2">
                  {drawMatches.filter(m => m.status === 'completed').length} of {drawMatches.length} matches
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Prize Pool Banner */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-gray-700">
                <TrophyIcon className="w-4 h-4 mr-1 text-yellow-600" />
                <span className="font-medium">Prize Pool: </span>
                <span className="font-bold text-green-600">${currentDraw.prizeMoney?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex items-center text-gray-700">
                <span className="font-medium">Entry Fee: </span>
                <span className="font-bold">${currentDraw.entryCost || '0'}</span>
              </div>
            </div>
            <div className="text-right text-gray-600">
              <span className="text-xs">Total Collected: </span>
              <span className="font-bold text-green-600">
                ${((currentDraw.entryCost || 0) * currentDraw.currentPlayers).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tournament Bracket */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="tournament-bracket">
          {/* Enhanced Round Headers */}
          <div className="flex justify-center mb-12">
            {displayRounds.map((round, index) => (
              <div key={round} className="flex-1 text-center relative">
                <div className="inline-block px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-bold shadow-lg transform hover:scale-105 transition-transform">
                  {round}
                </div>
                <div className="text-sm text-gray-600 mt-2 font-medium">
                  {matchesByRound[round].length} match{matchesByRound[round].length !== 1 ? 'es' : ''}
                </div>
                {index < displayRounds.length - 1 && (
                  <div className="absolute right-0 top-1/2 w-8 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 transform translate-x-1/2 -translate-y-1/2 z-0"></div>
                )}
              </div>
            ))}
          </div>

          {/* Enhanced Bracket Structure */}
          <div className="flex justify-center space-x-12 overflow-x-auto min-w-max">
            {displayRounds.map((round, roundIndex) => (
              <div key={round} className="flex flex-col justify-center space-y-6 min-w-72 relative">
                {matchesByRound[round].map((match, matchIndex) => (
                  <div
                    key={match.id}
                    className={`match-card border-2 rounded-xl p-5 cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 ${getMatchStatusColor(match.status)} bg-white shadow-lg hover-lift`}
                    onClick={() => setSelectedMatch(match)}
                  >
                    {/* Match Info Header */}
                    <div className="text-center mb-4 bg-gray-50 rounded-lg p-2">
                      <div className="text-xs text-gray-600 font-bold uppercase tracking-wide">
                        {match.roundName}
                      </div>
                      <div className="flex items-center justify-center text-xs text-gray-500 mt-1 space-x-3">
                        {match.scheduledTime && (
                          <div className="flex items-center">
                            <ClockIcon className="w-3 h-3 mr-1" />
                            {match.scheduledTime}
                          </div>
                        )}
                        {match.courtName && (
                          <div className="flex items-center">
                            <MapPinIcon className="w-3 h-3 mr-1" />
                            {match.courtName}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Players Display */}
                    <div className="space-y-3">
                      <div className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                        match.score && match.status === 'completed' && match.score.split(',')[0] > match.score.split(',')[1] 
                          ? 'bg-green-50 border-2 border-green-200' 
                          : 'bg-gray-50 border-2 border-gray-200'
                      }`}>
                        <span className="text-sm font-bold text-gray-900 truncate">
                          {match.player1Name || 'TBD'}
                        </span>
                        {match.score && match.status === 'completed' && (
                          <span className="text-lg font-bold font-mono text-gray-800 bg-white px-2 py-1 rounded">
                            {match.score.split(',')[0] || ''}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center text-sm font-bold text-gray-400 bg-gray-100 rounded-full w-8 h-8 mx-auto">
                        VS
                      </div>
                      
                      <div className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                        match.score && match.status === 'completed' && match.score.split(',')[1] > match.score.split(',')[0] 
                          ? 'bg-green-50 border-2 border-green-200' 
                          : 'bg-gray-50 border-2 border-gray-200'
                      }`}>
                        <span className="text-sm font-bold text-gray-900 truncate">
                          {match.player2Name || 'TBD'}
                        </span>
                        {match.score && match.status === 'completed' && (
                          <span className="text-lg font-bold font-mono text-gray-800 bg-white px-2 py-1 rounded">
                            {match.score.split(',')[1] || ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Enhanced Match Status */}
                    <div className="mt-4 pt-3 border-t border-gray-200">
                      <div className="flex justify-center">
                        <span className={`text-xs px-3 py-2 rounded-full font-bold uppercase tracking-wide flex items-center ${
                          match.status === 'completed' ? 'bg-green-100 text-green-800' :
                          match.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          match.status === 'postponed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {match.status === 'in-progress' && <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>}
                          {match.status.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Enhanced Connection Lines */}
                {roundIndex < displayRounds.length - 1 && (
                  <div className="absolute -right-6 top-1/2 w-12 h-0.5 bg-gradient-to-r from-blue-300 to-purple-300 transform -translate-y-1/2 z-10">
                    <div className="absolute right-0 top-1/2 w-2 h-2 bg-purple-400 rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Enhanced Draw Statistics */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover-lift">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <ClockIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Match Status</h4>
            </div>
            <div className="space-y-3 text-sm">
              {['scheduled', 'in-progress', 'completed', 'postponed'].map(status => {
                const count = drawMatches.filter(m => m.status === status).length
                return count > 0 ? (
                  <div key={status} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        status === 'completed' ? 'bg-green-500' :
                        status === 'in-progress' ? 'bg-blue-500 animate-pulse' :
                        status === 'postponed' ? 'bg-yellow-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="capitalize font-medium">{status.replace('-', ' ')}</span>
                    </div>
                    <span className="font-bold text-lg text-gray-900">{count}</span>
                  </div>
                ) : null
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover-lift">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <MapPinIcon className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Court Usage</h4>
            </div>
            <div className="space-y-3 text-sm">
              {state.courts.map(court => {
                const courtMatches = drawMatches.filter(m => m.courtId === court.id).length
                return courtMatches > 0 ? (
                  <div key={court.id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                    <span className="font-medium">{court.name}</span>
                    <div className="flex items-center">
                      <span className="font-bold text-lg text-gray-900 mr-2">{courtMatches}</span>
                      <div className="text-xs text-gray-500 capitalize">{court.surface}</div>
                    </div>
                  </div>
                ) : null
              })}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover-lift">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                <TrophyIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Prize Pool</h4>
            </div>
            <div className="space-y-3 text-sm">
              {currentDraw.prizeMoney && (
                <div className="flex justify-between items-center bg-green-50 rounded-lg px-3 py-2">
                  <span className="font-medium text-green-800">Prize Money</span>
                  <span className="font-bold text-lg text-green-600">${currentDraw.prizeMoney.toLocaleString()}</span>
                </div>
              )}
              {currentDraw.entryCost && (
                <div className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                  <span className="font-medium">Entry Fee</span>
                  <span className="font-bold text-lg text-gray-900">${currentDraw.entryCost}</span>
                </div>
              )}
              <div className="flex justify-between items-center bg-blue-50 rounded-lg px-3 py-2">
                <span className="font-medium text-blue-800">Total Collected</span>
                <span className="font-bold text-lg text-blue-600">
                  ${((currentDraw.entryCost || 0) * currentDraw.currentPlayers).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DrawView