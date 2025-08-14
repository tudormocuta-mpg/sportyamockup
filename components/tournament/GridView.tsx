import { useState, useMemo, useCallback } from 'react'
import { ChevronLeftIcon, ChevronRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { useTournament } from '@/contexts/TournamentContext'
import { Match, Court } from '@/types/tournament'
import PlayerMatchCard from './PlayerMatchCard'
import MatchDetailsCard from './MatchDetailsCard'

interface GridViewProps {
  selectedDate: string
}

const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30'
]

export default function GridView({ selectedDate }: GridViewProps) {
  const { state, rescheduleMatch, detectBlockers } = useTournament()
  const [draggedMatch, setDraggedMatch] = useState<Match | null>(null)
  const [hoveredSlot, setHoveredSlot] = useState<{ court: string; time: string } | null>(null)
  const [dragValidation, setDragValidation] = useState<{ [key: string]: { valid: boolean; reason?: string; warnings?: string[] } }>({})
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [isPlayerCardOpen, setIsPlayerCardOpen] = useState(false)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isMatchDetailsOpen, setIsMatchDetailsOpen] = useState(false)
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [conflictDetails, setConflictDetails] = useState<any>(null)
  const [pendingMove, setPendingMove] = useState<{ match: Match; court: string; time: string } | null>(null)

  // Filter matches for the selected date
  const dateMatches = useMemo(() => {
    return state.matches.filter(match => 
      match.scheduledDate === selectedDate
    )
  }, [state.matches, selectedDate])

  // Generate court availability and conflicts for drag validation
  const validateSlot = useCallback((court: string, time: string, excludeMatchId?: string): { valid: boolean; reason?: string; warnings?: string[] } => {
    if (!draggedMatch) return { valid: true }

    const courtObj = state.courts.find(c => c.id === court || c.name === court)
    if (!courtObj) return { valid: false, reason: 'Court not found' }

    // Check if slot is already occupied
    const existingMatch = dateMatches.find(m => 
      m.courtId === courtObj.id && 
      m.scheduledTime === time && 
      m.id !== excludeMatchId
    )
    
    if (existingMatch) {
      return { valid: false, reason: `Court occupied by ${existingMatch.player1Name} vs ${existingMatch.player2Name}` }
    }

    // Check court availability
    const availability = courtObj.availability.find(a => a.date === selectedDate)
    if (availability?.blocked) {
      return { valid: false, reason: availability.reason || 'Court maintenance' }
    }

    const timeHour = parseInt(time.split(':')[0])
    const timeMinute = parseInt(time.split(':')[1])
    const timeInMinutes = timeHour * 60 + timeMinute
    const startTime = availability?.startTime ? 
      parseInt(availability.startTime.split(':')[0]) * 60 + parseInt(availability.startTime.split(':')[1]) : 480
    const endTime = availability?.endTime ? 
      parseInt(availability.endTime.split(':')[0]) * 60 + parseInt(availability.endTime.split(':')[1]) : 1320

    if (timeInMinutes < startTime || timeInMinutes >= endTime) {
      return { valid: false, reason: 'Outside court operating hours' }
    }

    // Check player rest period violations
    const warnings: string[] = []
    const matchDuration = draggedMatch.duration || state.config.defaultMatchDuration
    const matchEndTime = timeInMinutes + matchDuration

    // Find player's other matches on the same day
    const player1Matches = dateMatches.filter(m => 
      (m.player1Id === draggedMatch.player1Id || m.player2Id === draggedMatch.player1Id) && 
      m.id !== draggedMatch.id &&
      m.scheduledTime
    )
    const player2Matches = dateMatches.filter(m => 
      (m.player1Id === draggedMatch.player2Id || m.player2Id === draggedMatch.player2Id) && 
      m.id !== draggedMatch.id &&
      m.scheduledTime
    )

    // Check rest period for both players
    const allPlayerMatches = [...player1Matches, ...player2Matches]
    allPlayerMatches.forEach(otherMatch => {
      const otherTime = parseInt(otherMatch.scheduledTime!.split(':')[0]) * 60 + parseInt(otherMatch.scheduledTime!.split(':')[1])
      const otherDuration = otherMatch.duration || state.config.defaultMatchDuration
      const otherEndTime = otherTime + otherDuration

      const timeBetween = Math.min(
        Math.abs(timeInMinutes - otherEndTime),
        Math.abs(otherTime - matchEndTime)
      )

      if (timeBetween < state.config.minimumRestPeriod) {
        const playerName = player1Matches.includes(otherMatch) ? draggedMatch.player1Name : draggedMatch.player2Name
        warnings.push(`${playerName} has less than ${state.config.minimumRestPeriod} minutes rest`)
      }
    })

    return { valid: true, warnings }
  }, [draggedMatch, state.courts, state.config, dateMatches, selectedDate])

  // Pre-calculate validation for all slots when drag starts
  const calculateDragValidation = useCallback((match: Match) => {
    const validation: { [key: string]: { valid: boolean; reason?: string; warnings?: string[] } } = {}
    
    state.courts.forEach(court => {
      timeSlots.forEach(time => {
        const key = `${court.id}-${time}`
        validation[key] = validateSlot(court.id, time, match.id)
      })
    })
    
    setDragValidation(validation)
  }, [validateSlot, state.courts])

  const getMatchForSlot = useCallback((court: string, time: string): Match | null => {
    const courtObj = state.courts.find(c => c.id === court || c.name === court)
    if (!courtObj) return null
    
    return dateMatches.find(match => 
      match.courtId === courtObj.id && match.scheduledTime === time
    ) || null
  }, [dateMatches, state.courts])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-l-4 border-green-400 text-green-800'
      case 'in-progress':
        return 'bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800'
      case 'scheduled':
        return 'bg-blue-50 border-l-4 border-blue-400 text-blue-800'
      case 'walkover':
        return 'bg-gray-50 border-l-4 border-gray-400 text-gray-800'
      case 'postponed':
        return 'bg-red-50 border-l-4 border-red-400 text-red-800'
      default:
        return 'bg-gray-50 border-l-4 border-gray-300 text-gray-800'
    }
  }

  const handleMatchClick = (match: Match) => {
    setSelectedMatch(match)
    setIsMatchDetailsOpen(true)
  }

  const handlePlayerClick = (playerName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedPlayer(playerName)
    setIsPlayerCardOpen(true)
  }

  const handleDragStart = (match: Match, e: React.DragEvent) => {
    setDraggedMatch(match)
    calculateDragValidation(match)
    
    // Add visual feedback to dragged element
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', `${match.player1Name} vs ${match.player2Name}`)
  }

  const handleDragOver = (e: React.DragEvent, court: string, time: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setHoveredSlot({ court, time })
  }

  const handleDragLeave = () => {
    setHoveredSlot(null)
  }

  const handleDrop = (e: React.DragEvent, court: string, time: string) => {
    e.preventDefault()
    
    if (!draggedMatch) return

    const courtObj = state.courts.find(c => c.id === court || c.name === court)
    if (!courtObj) return

    const validation = dragValidation[`${courtObj.id}-${time}`]
    
    if (!validation.valid) {
      // Show conflict dialog
      setConflictDetails({
        match: draggedMatch,
        targetCourt: courtObj.name,
        targetTime: time,
        reason: validation.reason,
        canProceed: false
      })
      setShowConflictDialog(true)
      return
    }

    if (validation.warnings && validation.warnings.length > 0) {
      // Show warning dialog but allow proceeding
      setConflictDetails({
        match: draggedMatch,
        targetCourt: courtObj.name,
        targetTime: time,
        warnings: validation.warnings,
        canProceed: true
      })
      setPendingMove({ match: draggedMatch, court: courtObj.id, time })
      setShowConflictDialog(true)
      return
    }

    // Direct move - no conflicts
    performMove(draggedMatch, courtObj.id, time)
  }

  const performMove = (match: Match, courtId: string, time: string) => {
    rescheduleMatch(match.id, courtId, selectedDate, time)
    
    // Cleanup
    setDraggedMatch(null)
    setHoveredSlot(null)
    setDragValidation({})
    setPendingMove(null)
    setShowConflictDialog(false)
    
    // Trigger blocker detection
    setTimeout(() => detectBlockers(), 100)
  }

  const handleConflictDialogProceed = () => {
    if (pendingMove) {
      performMove(pendingMove.match, pendingMove.court, pendingMove.time)
    }
  }

  const handleConflictDialogCancel = () => {
    setShowConflictDialog(false)
    setConflictDetails(null)
    setPendingMove(null)
    setDraggedMatch(null)
    setHoveredSlot(null)
    setDragValidation({})
  }

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const changeDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate)
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      currentDate.setDate(currentDate.getDate() + 1)
    }
    // This would need to be passed up to parent component
    console.log('Change date to:', currentDate.toISOString().split('T')[0])
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Schedule Grid - {formatDateHeader(selectedDate)}
            </h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => changeDate('prev')}
                className="p-1 hover:bg-gray-200 rounded">
                <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
              </button>
              <span className="text-sm text-gray-600 px-3 py-1 bg-white rounded border">Today</span>
              <button 
                onClick={() => changeDate('next')}
                className="p-1 hover:bg-gray-200 rounded">
                <ChevronRightIcon className="h-5 w-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto overflow-y-auto max-h-[70vh]">
          <table className="w-full table-fixed border-collapse">
            {/* Table Header */}
            <thead className="sticky top-0 bg-gray-100 z-10">
              <tr>
                <th className="w-20 p-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 bg-gray-50">
                  Time
                </th>
                {state.courts.map((court) => (
                  <th key={court.id} className="p-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider border-r border-gray-200 bg-gray-50 min-w-[200px]">
                    <div className="flex flex-col items-center">
                      <span className="font-bold">{court.name}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        {court.isFinalsCourt && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Finals
                          </span>
                        )}
                        <span className="text-xs text-gray-500 capitalize">
                          {court.surface} • {court.indoor ? 'Indoor' : 'Outdoor'}
                        </span>
                      </div>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>
              {timeSlots.map((time, timeIndex) => (
                <tr key={time} className={`${timeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-25 transition-colors`}>
                  {/* Time Column */}
                  <td className="p-3 text-sm font-medium text-gray-700 border-r border-gray-200 bg-gray-50 sticky left-0 z-5">
                    <div className="text-center">
                      <div className="font-bold">{time}</div>
                      <div className="text-xs text-gray-400">
                        {parseInt(time.split(':')[0]) < 12 ? 'AM' : 'PM'}
                      </div>
                    </div>
                  </td>

                  {/* Court Columns */}
                  {state.courts.map((court) => {
                    const match = getMatchForSlot(court.id, time)
                    const isDropTarget = hoveredSlot?.court === court.id && hoveredSlot?.time === time
                    const slotKey = `${court.id}-${time}`
                    const validation = dragValidation[slotKey]
                    const isValidDrop = validation?.valid
                    const hasWarnings = validation?.warnings && validation.warnings.length > 0

                    return (
                      <td
                        key={`${court.id}-${time}`}
                        className={`p-2 border-r border-gray-200 border-b border-gray-100 relative min-h-[80px] transition-all duration-200 ${
                          isDropTarget && draggedMatch
                            ? isValidDrop 
                              ? hasWarnings
                                ? 'bg-yellow-100 ring-2 ring-yellow-400 ring-inset'
                                : 'bg-green-100 ring-2 ring-green-400 ring-inset' 
                              : 'bg-red-100 ring-2 ring-red-400 ring-inset'
                            : ''
                        }`}
                        onDragOver={(e) => handleDragOver(e, court.id, time)}
                        onDrop={(e) => handleDrop(e, court.id, time)}
                        onDragLeave={handleDragLeave}
                      >
                        {/* Drop Zone Indicator */}
                        {draggedMatch && isDropTarget && (
                          <div className="absolute inset-1 flex items-center justify-center pointer-events-none z-20">
                            {!isValidDrop ? (
                              <div className="bg-red-500 text-white text-xs rounded px-2 py-1 font-medium shadow-lg max-w-full truncate">
                                ✕ {validation.reason}
                              </div>
                            ) : hasWarnings ? (
                              <div className="bg-yellow-500 text-white text-xs rounded px-2 py-1 font-medium shadow-lg max-w-full truncate">
                                ⚠ {validation.warnings![0]}
                              </div>
                            ) : (
                              <div className="bg-green-500 text-white text-xs rounded px-2 py-1 font-medium shadow-lg">
                                ✓ Drop to reschedule
                              </div>
                            )}
                          </div>
                        )}

                        {match ? (
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(match, e)}
                            onClick={() => handleMatchClick(match)}
                            className={`p-3 rounded-md cursor-move hover:shadow-lg transition-all duration-200 ${getStatusColor(match.status)} ${
                              draggedMatch?.id === match.id ? 'opacity-60 scale-95 rotate-1' : 'hover:scale-105'
                            }`}
                            style={{ minHeight: '70px' }}
                          >
                            {/* Match Header */}
                            <div className="text-xs font-medium text-gray-600 mb-2 truncate">
                              {match.drawName} • {match.round}
                            </div>
                            
                            {/* Players */}
                            <div className="space-y-1">
                              <div 
                                className="text-sm font-bold cursor-pointer hover:underline truncate"
                                onClick={(e) => match.player1Name && handlePlayerClick(match.player1Name, e)}
                                title={match.player1Name}
                              >
                                {match.player1Name}
                              </div>
                              <div className="text-xs text-gray-500 text-center">vs</div>
                              <div 
                                className="text-sm font-bold cursor-pointer hover:underline truncate"
                                onClick={(e) => match.player2Name && handlePlayerClick(match.player2Name, e)}
                                title={match.player2Name}
                              >
                                {match.player2Name}
                              </div>
                            </div>
                            
                            {/* Score */}
                            {match.score && (
                              <div className="text-xs font-medium mt-2 pt-2 border-t border-gray-300 truncate" title={match.score}>
                                {match.score}
                              </div>
                            )}
                            
                            {/* Time and Status */}
                            <div className="flex items-center justify-between mt-2 text-xs">
                              <span className="text-gray-600">
                                {match.scheduledTime}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                match.status === 'completed' ? 'bg-green-200 text-green-800' :
                                match.status === 'in-progress' ? 'bg-yellow-200 text-yellow-800' :
                                match.status === 'scheduled' ? 'bg-blue-200 text-blue-800' :
                                'bg-gray-200 text-gray-800'
                              }`}>
                                {match.status === 'in-progress' ? 'LIVE' : 
                                 match.status === 'completed' ? 'DONE' :
                                 match.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="h-20 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-md hover:border-gray-300 hover:bg-gray-50 transition-colors">
                            <div className="text-center">
                              <div className="text-xs">Available</div>
                              <div className="text-xs text-gray-300">{time}</div>
                            </div>
                          </div>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend and Stats */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-green-50 border-l-4 border-green-400 rounded-sm"></div>
                <span className="text-gray-600">Completed ({dateMatches.filter(m => m.status === 'completed').length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-yellow-50 border-l-4 border-yellow-400 rounded-sm"></div>
                <span className="text-gray-600">In Progress ({dateMatches.filter(m => m.status === 'in-progress').length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-blue-50 border-l-4 border-blue-400 rounded-sm"></div>
                <span className="text-gray-600">Scheduled ({dateMatches.filter(m => m.status === 'scheduled').length})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-gray-50 border-l-4 border-gray-400 rounded-sm"></div>
                <span className="text-gray-600">Other ({dateMatches.filter(m => !['completed', 'in-progress', 'scheduled'].includes(m.status)).length})</span>
              </div>
            </div>
            <div className="text-gray-500 flex items-center space-x-4">
              <span>🖱️ Drag matches to reschedule</span>
              <span>👤 Click players for details</span>
              <span className="font-medium">{dateMatches.length} matches today</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Resolution Dialog */}
      {showConflictDialog && conflictDetails && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">
                  {conflictDetails.canProceed ? 'Schedule Warning' : 'Schedule Conflict'}
                </h3>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Moving {conflictDetails.match.player1Name} vs {conflictDetails.match.player2Name} to{' '}
                  <strong>{conflictDetails.targetCourt}</strong> at <strong>{conflictDetails.targetTime}</strong>
                </p>
                
                {conflictDetails.reason && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm text-red-800">{conflictDetails.reason}</p>
                  </div>
                )}
                
                {conflictDetails.warnings && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="text-sm font-medium text-yellow-800 mb-1">Warnings:</p>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {conflictDetails.warnings.map((warning: string, index: number) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleConflictDialogCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                {conflictDetails.canProceed && (
                  <button
                    onClick={handleConflictDialogProceed}
                    className="px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-md hover:bg-yellow-700"
                  >
                    Proceed Anyway
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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