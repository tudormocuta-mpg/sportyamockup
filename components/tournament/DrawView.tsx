import React, { useState, useMemo } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Match } from '../../types/tournament'

interface BracketMatch {
  match: Match | null
  matchNumber: number
  round: number
  position: number
}

const DrawView: React.FC = () => {
  const { state, setSelectedMatch } = useTournament()
  const [selectedDraw, setSelectedDraw] = useState<string>(state.draws[0]?.id || '')
  const [hoveredMatch, setHoveredMatch] = useState<string | null>(null)

  // Get current draw
  const currentDraw = state.draws.find(d => d.id === selectedDraw)
  
  // Get matches for current draw
  const drawMatches = state.matches.filter(match => match.drawId === selectedDraw)

  // Define round names based on draw size
  const getRoundNames = (drawSize: number) => {
    if (drawSize <= 8) {
      return ['QF', 'SF', 'F']
    } else if (drawSize <= 16) {
      return ['R16', 'QF', 'SF', 'F']
    } else if (drawSize <= 32) {
      return ['R32', 'R16', 'QF', 'SF', 'F']
    } else if (drawSize <= 64) {
      return ['R64', 'R32', 'R16', 'QF', 'SF', 'F']
    } else {
      return ['R128', 'R64', 'R32', 'R16', 'QF', 'SF', 'F']
    }
  }

  const getFullRoundName = (abbreviation: string) => {
    const map: Record<string, string> = {
      'R128': 'Round of 128',
      'R64': 'Round of 64',
      'R32': 'Round of 32',
      'R16': 'Round of 16',
      'QF': 'Quarter-Finals',
      'SF': 'Semi-Finals',
      'F': 'Final'
    }
    return map[abbreviation] || abbreviation
  }

  // Create bracket structure
  const bracketStructure = useMemo(() => {
    if (!currentDraw) return []

    const drawSize = currentDraw.maxPlayers || 32
    const rounds = getRoundNames(drawSize)
    const bracket: BracketMatch[][] = []

    let matchesInRound = drawSize / 2
    let matchNumber = 1

    rounds.forEach((roundName, roundIndex) => {
      const roundMatches: BracketMatch[] = []
      const fullRoundName = getFullRoundName(roundName)
      const actualMatches = drawMatches.filter(m => {
        return m.roundName === fullRoundName ||
               m.roundName === roundName ||
               m.roundName?.includes(fullRoundName.replace('-', ''))
      })

      for (let i = 0; i < matchesInRound; i++) {
        const actualMatch = actualMatches[i] || null
        roundMatches.push({
          match: actualMatch,
          matchNumber: matchNumber++,
          round: roundIndex,
          position: i
        })
      }

      bracket.push(roundMatches)
      matchesInRound = Math.floor(matchesInRound / 2)
    })

    return bracket
  }, [currentDraw, drawMatches])

  // Get match winner
  const getMatchWinner = (match: Match | null): 1 | 2 | null => {
    if (!match || match.status !== 'completed' || !match.score) return null
    
    const scores = match.score.split(',').map(set => {
      const [s1, s2] = set.trim().split('-').map(Number)
      return s1 > s2 ? 1 : 2
    })
    
    const player1Sets = scores.filter(s => s === 1).length
    const player2Sets = scores.filter(s => s === 2).length
    
    if (player1Sets > player2Sets) return 1
    if (player2Sets > player1Sets) return 2
    return null
  }

  // Calculate match spacing
  const getMatchSpacing = (round: number) => {
    const baseHeight = 56 // Height of match box in pixels
    const gap = 4 // Gap between matches
    return Math.pow(2, round) * (baseHeight + gap) - gap
  }

  if (!currentDraw) {
    return (
      <div className="draw-view h-full flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-500">
          <div className="text-sm font-medium">No draws available</div>
        </div>
      </div>
    )
  }

  const rounds = getRoundNames(currentDraw.maxPlayers || 32)

  return (
    <div className="draw-view h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Draw Selector */}
              <select
                value={selectedDraw}
                onChange={(e) => setSelectedDraw(e.target.value)}
                className="px-3 py-1.5 bg-white text-gray-900 border border-gray-300 rounded text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {state.draws.map(draw => (
                  <option key={draw.id} value={draw.id}>
                    {draw.name}
                  </option>
                ))}
              </select>
              
              <div className="text-sm text-gray-600">
                <span className="font-medium">{currentDraw.format.replace('-', ' ')}</span>
                <span className="mx-2">•</span>
                <span>Draw Size: {currentDraw.maxPlayers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bracket Container */}
      <div className="flex-1 overflow-auto bg-gray-50 p-4">
        <div className="inline-block min-w-full">
          {/* Round Headers */}
          <div className="flex mb-2">
            {rounds.map((round, index) => (
              <div key={index} className="w-48 text-center">
                <div className="text-xs font-semibold text-gray-600 uppercase">
                  {getFullRoundName(round)}
                </div>
              </div>
            ))}
          </div>

          {/* Bracket */}
          <div className="flex relative">
            {bracketStructure.map((round, roundIndex) => {
              const spacing = getMatchSpacing(roundIndex)
              const marginTop = roundIndex === 0 ? 0 : (spacing - 56) / 2
              
              return (
                <div key={roundIndex} className="w-48 relative">
                  {round.map((bracketMatch, matchIndex) => {
                    const match = bracketMatch.match
                    const winner = getMatchWinner(match)
                    const isHovered = hoveredMatch === match?.id
                    
                    return (
                      <div
                        key={matchIndex}
                        className="absolute"
                        style={{
                          top: `${marginTop + matchIndex * (spacing + 4)}px`,
                          width: '176px'
                        }}
                      >
                        {/* Match Box */}
                        <div
                          className={`bg-white border rounded overflow-hidden transition-all ${
                            isHovered ? 'shadow-lg border-blue-400' : 'shadow-sm border-gray-200'
                          } ${match ? 'cursor-pointer' : ''}`}
                          onMouseEnter={() => match && setHoveredMatch(match.id)}
                          onMouseLeave={() => setHoveredMatch(null)}
                          onClick={() => match && setSelectedMatch(match)}
                        >
                          {/* Match Number */}
                          <div className="bg-gray-100 px-2 py-0.5 text-xs text-gray-600 font-medium border-b border-gray-200">
                            Match {bracketMatch.matchNumber}
                          </div>
                          
                          {/* Player 1 */}
                          <div className={`px-2 py-1.5 text-sm border-b border-gray-100 flex items-center justify-between ${
                            winner === 1 ? 'bg-green-50 font-semibold' : ''
                          }`}>
                            <span className={`truncate ${!match?.player1Name ? 'text-gray-400' : 'text-gray-900'}`}>
                              {match?.player1Name || 'TBD'}
                            </span>
                            {match?.status === 'completed' && match.score && (
                              <span className="font-mono text-xs ml-2">
                                {match.score.split(',').map(s => s.split('-')[0]).join(' ')}
                              </span>
                            )}
                          </div>
                          
                          {/* Player 2 */}
                          <div className={`px-2 py-1.5 text-sm flex items-center justify-between ${
                            winner === 2 ? 'bg-green-50 font-semibold' : ''
                          }`}>
                            <span className={`truncate ${!match?.player2Name ? 'text-gray-400' : 'text-gray-900'}`}>
                              {match?.player2Name || 'TBD'}
                            </span>
                            {match?.status === 'completed' && match.score && (
                              <span className="font-mono text-xs ml-2">
                                {match.score.split(',').map(s => s.split('-')[1]).join(' ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Connection Lines */}
                        {roundIndex < bracketStructure.length - 1 && (
                          <>
                            {/* Horizontal line from match */}
                            <div
                              className="absolute border-t border-gray-300"
                              style={{
                                left: '176px',
                                top: '28px',
                                width: '16px'
                              }}
                            />
                            
                            {/* Vertical connector */}
                            {matchIndex % 2 === 0 && (
                              <>
                                <div
                                  className="absolute border-r border-gray-300"
                                  style={{
                                    left: '192px',
                                    top: '28px',
                                    height: `${spacing / 2 + 2}px`
                                  }}
                                />
                                {/* Horizontal to next match */}
                                <div
                                  className="absolute border-t border-gray-300"
                                  style={{
                                    left: '192px',
                                    top: `${28 + spacing / 2 + 2}px`,
                                    width: '8px'
                                  }}
                                />
                              </>
                            )}
                            
                            {matchIndex % 2 === 1 && (
                              <>
                                <div
                                  className="absolute border-r border-gray-300"
                                  style={{
                                    left: '192px',
                                    top: `${28 - spacing / 2 - 2}px`,
                                    height: `${spacing / 2 + 2}px`
                                  }}
                                />
                              </>
                            )}
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Match Details Popup */}
          {hoveredMatch && (
            <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-sm z-50 border border-gray-200">
              {(() => {
                const match = drawMatches.find(m => m.id === hoveredMatch)
                if (!match) return null
                
                return (
                  <>
                    <div className="text-sm font-semibold text-gray-900 mb-2">
                      {match.drawName} - {match.roundName}
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      {match.scheduledDate && (
                        <div>Date: {new Date(match.scheduledDate).toLocaleDateString()}</div>
                      )}
                      {match.scheduledTime && (
                        <div>Time: {match.scheduledTime}</div>
                      )}
                      {match.courtName && (
                        <div>Court: {match.courtName}</div>
                      )}
                      <div>Status: <span className="font-medium capitalize">{match.status.replace('-', ' ')}</span></div>
                    </div>
                  </>
                )
              })()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DrawView