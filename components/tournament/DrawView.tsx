import { useState } from 'react'
import { ChevronDownIcon, ClockIcon, MapPinIcon, TrophyIcon } from '@heroicons/react/24/outline'
import { useTournament } from '@/contexts/TournamentContext'
import { Match } from '@/types/tournament'
import PlayerMatchCard from './PlayerMatchCard'
import MatchDetailsCard from './MatchDetailsCard'

export default function DrawView() {
  const { state } = useTournament()
  const [selectedDraw, setSelectedDraw] = useState(state.draws[0]?.id || '')
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [isPlayerCardOpen, setIsPlayerCardOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isMatchDetailsOpen, setIsMatchDetailsOpen] = useState(false)

  const currentDraw = state.draws.find(d => d.id === selectedDraw)
  const drawMatches = state.matches.filter(m => m.drawId === selectedDraw)

  const handlePlayerClick = (playerName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPlayer(playerName)
    setIsPlayerCardOpen(true)
  }

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match)
    setIsMatchDetailsOpen(true)
  }

  const getMatchByRoundAndPosition = (round: string, position: number): Match | null => {
    const roundMatches = drawMatches.filter(m => m.round === round)
    return roundMatches[position] || null
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-800'
      case 'in-progress':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800'
      case 'scheduled':
        return 'bg-blue-100 border-blue-300 text-blue-800'
      case 'walkover':
        return 'bg-gray-100 border-gray-300 text-gray-800'
      case 'postponed':
        return 'bg-red-100 border-red-300 text-red-800'
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800'
    }
  }

  const renderKnockoutBracket = () => {
    if (!currentDraw) return null

    const rounds = currentDraw.rounds
    const bracketHeight = Math.max(8, drawMatches.length) * 120 // Dynamic height based on matches

    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow p-6" style={{ minHeight: `${bracketHeight}px` }}>
        <div className="flex space-x-8" style={{ minWidth: `${rounds.length * 320}px` }}>
          {rounds.map((round, roundIndex) => {
            const roundMatches = drawMatches.filter(m => m.round === round)
            const isLastRound = roundIndex === rounds.length - 1

            return (
              <div key={round} className="flex flex-col justify-center space-y-6" style={{ minWidth: '300px' }}>
                {/* Round Header */}
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">{round}</h3>
                  <p className="text-sm text-gray-500">{roundMatches.length} matches</p>
                </div>

                {/* Matches */}
                <div className="space-y-6">
                  {roundMatches.map((match, matchIndex) => (
                    <div key={match.id} className="relative">
                      <div
                        onClick={() => handleMatchClick(match)}
                        className={`border-2 rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${getStatusColor(match.status)} ${isLastRound ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-300' : ''}`}
                      >
                        {/* Match Header */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-medium text-gray-600">
                            Match #{match.matchNumber || matchIndex + 1}
                          </span>
                          {isLastRound && (
                            <TrophyIcon className="h-4 w-4 text-yellow-600" />
                          )}
                        </div>

                        {/* Players */}
                        <div className="space-y-2">
                          <div 
                            className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-white/50 ${
                              match.winner === match.player1Id ? 'font-bold bg-white/30' : ''
                            }`}
                            onClick={(e) => match.player1Name && handlePlayerClick(match.player1Name, e)}
                          >
                            <span className="text-sm">
                              {match.player1Name || 'TBD'}
                            </span>
                            {match.score && match.winner === match.player1Id && (
                              <TrophyIcon className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          
                          <div className="text-center text-xs text-gray-500">vs</div>
                          
                          <div 
                            className={`flex items-center justify-between p-2 rounded cursor-pointer hover:bg-white/50 ${
                              match.winner === match.player2Id ? 'font-bold bg-white/30' : ''
                            }`}
                            onClick={(e) => match.player2Name && handlePlayerClick(match.player2Name, e)}
                          >
                            <span className="text-sm">
                              {match.player2Name || 'TBD'}
                            </span>
                            {match.score && match.winner === match.player2Id && (
                              <TrophyIcon className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                        </div>

                        {/* Score */}
                        {match.score && (
                          <div className="mt-3 pt-2 border-t border-gray-200 text-center">
                            <span className="text-xs font-medium text-gray-700">{match.score}</span>
                          </div>
                        )}

                        {/* Match Details */}
                        {match.scheduledDate && match.scheduledTime && (
                          <div className="mt-3 pt-2 border-t border-gray-200 space-y-1">
                            <div className="flex items-center text-xs text-gray-600">
                              <ClockIcon className="h-3 w-3 mr-1" />
                              {match.scheduledDate} at {match.scheduledTime}
                            </div>
                            {match.courtName && (
                              <div className="flex items-center text-xs text-gray-600">
                                <MapPinIcon className="h-3 w-3 mr-1" />
                                {match.courtName}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            match.status === 'completed' ? 'bg-green-100 text-green-800' :
                            match.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                            match.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                            match.status === 'walkover' ? 'bg-gray-100 text-gray-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {match.status.charAt(0).toUpperCase() + match.status.slice(1).replace('-', ' ')}
                          </span>
                        </div>
                      </div>

                      {/* Connection Lines */}
                      {roundIndex < rounds.length - 1 && (
                        <div className="absolute top-1/2 -right-8 w-8 h-0.5 bg-gray-300" 
                             style={{ transform: 'translateY(-50%)' }} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDrawStats = () => {
    if (!currentDraw) return null

    const totalMatches = drawMatches.length
    const completedMatches = drawMatches.filter(m => m.status === 'completed').length
    const inProgressMatches = drawMatches.filter(m => m.status === 'in-progress').length
    const scheduledMatches = drawMatches.filter(m => m.status === 'scheduled').length

    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalMatches}</div>
            <div className="text-sm text-gray-500">Total Matches</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedMatches}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{inProgressMatches}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{scheduledMatches}</div>
            <div className="text-sm text-gray-500">Scheduled</div>
          </div>
        </div>
      </div>
    )
  }

  if (state.draws.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <TrophyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Draws Available</h3>
        <p className="text-sm text-gray-500">
          Draws are imported from SportyaOS. Please ensure your tournament has been set up properly.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        {/* Draw Selector */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Draw Visualization</h2>
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">Select Draw:</label>
              <select
                value={selectedDraw}
                onChange={(e) => setSelectedDraw(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                {state.draws.map(draw => (
                  <option key={draw.id} value={draw.id}>
                    {draw.name} ({draw.numberOfPlayers} players)
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {currentDraw && (
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Format:</span>
                <span className="ml-2 font-medium capitalize">{currentDraw.format}</span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>
                <span className="ml-2 font-medium capitalize">{currentDraw.type.replace('+', ' + ')}</span>
              </div>
              <div>
                <span className="text-gray-500">Players:</span>
                <span className="ml-2 font-medium">{currentDraw.numberOfPlayers}</span>
              </div>
              <div>
                <span className="text-gray-500">Rounds:</span>
                <span className="ml-2 font-medium">{currentDraw.rounds.length}</span>
              </div>
            </div>
          )}
        </div>

        {/* Draw Stats */}
        {renderDrawStats()}

        {/* Bracket Visualization */}
        {currentDraw && currentDraw.type === 'knockout' && renderKnockoutBracket()}

        {/* Group Stage View (for group+knockout format) */}
        {currentDraw && currentDraw.type === 'group+knockout' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center py-12">
              <TrophyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Group Stage View</h3>
              <p className="text-sm text-gray-500">
                Group stage visualization will be available in a future update.
                <br />
                For now, use the Grid or List view to manage group matches.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Player Match Card */}
      <PlayerMatchCard
        isOpen={isPlayerCardOpen}
        onClose={() => setIsPlayerCardOpen(false)}
        playerName={selectedPlayer || ''}
      />

      {/* Match Details Card */}
      <MatchDetailsCard
        isOpen={isMatchDetailsOpen}
        onClose={() => setIsMatchDetailsOpen(false)}
        match={selectedMatch}
      />
    </>
  )
}