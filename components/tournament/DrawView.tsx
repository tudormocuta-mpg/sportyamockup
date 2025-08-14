import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'

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
    <div className="draw-view h-full flex flex-col bg-white">
      {/* Draw Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center space-x-4 mb-4">
              <select
                value={selectedDraw}
                onChange={(e) => setSelectedDraw(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {state.draws.map(draw => (
                  <option key={draw.id} value={draw.id}>
                    {draw.name} ({draw.format.replace('-', ' ')})
                  </option>
                ))}
              </select>
              
              <div className={`px-3 py-1 rounded text-sm font-medium ${
                currentDraw.status === 'completed' ? 'bg-green-100 text-green-800' :
                currentDraw.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {currentDraw.status.replace('-', ' ')}
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentDraw.name}</h2>
            <div className="text-gray-600 space-y-1">
              <div>Format: <span className="font-medium">{currentDraw.format.replace('-', ' ')}</span></div>
              <div>Category: <span className="font-medium">{currentDraw.category.replace('-', ' ')}</span></div>
              <div>Players: <span className="font-medium">{currentDraw.currentPlayers} / {currentDraw.maxPlayers}</span></div>
            </div>
          </div>

          <div className="text-right">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{getDrawProgress()}%</div>
              <div className="text-sm text-gray-600">Complete</div>
              <div className="w-24 bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getDrawProgress()}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tournament Bracket */}
      <div className="flex-1 overflow-auto p-6">
        <div className="tournament-bracket">
          {/* Round Headers */}
          <div className="flex justify-center mb-8">
            {displayRounds.map((round, index) => (
              <div key={round} className="flex-1 text-center">
                <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg font-semibold text-gray-800">
                  {round}
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {matchesByRound[round].length} match{matchesByRound[round].length !== 1 ? 'es' : ''}
                </div>
              </div>
            ))}
          </div>

          {/* Bracket Structure */}
          <div className="flex justify-center space-x-8 overflow-x-auto min-w-max">
            {displayRounds.map((round, roundIndex) => (
              <div key={round} className="flex flex-col justify-center space-y-4 min-w-64">
                {matchesByRound[round].map((match, matchIndex) => (
                  <div
                    key={match.id}
                    className={`match-card border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${getMatchStatusColor(match.status)}`}
                    onClick={() => setSelectedMatch(match)}
                  >
                    {/* Match Info */}
                    <div className="text-center mb-3">
                      <div className="text-xs text-gray-500 font-medium">
                        {match.roundName}
                      </div>
                      {match.scheduledTime && (
                        <div className="text-xs text-gray-600">
                          {match.scheduledTime}
                        </div>
                      )}
                    </div>

                    {/* Players */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                        <span className="text-sm font-medium text-gray-900">
                          {match.player1Name || 'TBD'}
                        </span>
                        {match.score && match.status === 'completed' && (
                          <span className="text-xs font-mono text-gray-600">
                            {match.score.split(',')[0] || ''}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-center text-xs text-gray-400">
                        vs
                      </div>
                      
                      <div className="flex items-center justify-between bg-white rounded px-3 py-2">
                        <span className="text-sm font-medium text-gray-900">
                          {match.player2Name || 'TBD'}
                        </span>
                        {match.score && match.status === 'completed' && (
                          <span className="text-xs font-mono text-gray-600">
                            {match.score.split(',')[1] || ''}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Match Details */}
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded ${
                          match.status === 'completed' ? 'bg-green-100 text-green-700' :
                          match.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                          match.status === 'postponed' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {match.status.replace('-', ' ')}
                        </span>
                        
                        {match.courtName && (
                          <span className="text-xs text-gray-600">
                            {match.courtName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Connection Lines (Visual) */}
                {roundIndex < displayRounds.length - 1 && (
                  <div className="absolute right-0 top-1/2 w-8 border-t border-gray-300 transform translate-x-full -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Draw Statistics */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Match Status</h4>
            <div className="space-y-2 text-sm">
              {['scheduled', 'in-progress', 'completed', 'postponed'].map(status => {
                const count = drawMatches.filter(m => m.status === status).length
                return count > 0 ? (
                  <div key={status} className="flex justify-between">
                    <span className="capitalize">{status.replace('-', ' ')}</span>
                    <span className="font-medium">{count}</span>
                  </div>
                ) : null
              })}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Court Usage</h4>
            <div className="space-y-2 text-sm">
              {state.courts.map(court => {
                const courtMatches = drawMatches.filter(m => m.courtId === court.id).length
                return courtMatches > 0 ? (
                  <div key={court.id} className="flex justify-between">
                    <span>{court.name}</span>
                    <span className="font-medium">{courtMatches}</span>
                  </div>
                ) : null
              })}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Prize Information</h4>
            <div className="space-y-2 text-sm">
              {currentDraw.prizeMoney && (
                <div className="flex justify-between">
                  <span>Prize Money</span>
                  <span className="font-medium">${currentDraw.prizeMoney.toLocaleString()}</span>
                </div>
              )}
              {currentDraw.entryCost && (
                <div className="flex justify-between">
                  <span>Entry Fee</span>
                  <span className="font-medium">${currentDraw.entryCost}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Total Entry</span>
                <span className="font-medium">
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