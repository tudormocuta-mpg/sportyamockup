import React, { useState, useEffect } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Match, Blocker } from '../../types/tournament'
import { ExclamationTriangleIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const GridView: React.FC = () => {
  const { state, moveMatch, setSelectedMatch, checkConflicts } = useTournament()
  const [draggedMatch, setDraggedMatch] = useState<Match | null>(null)
  const [dragOverCell, setDragOverCell] = useState<{ courtId: string; timeSlot: string } | null>(null)
  const [hoveredMatch, setHoveredMatch] = useState<string | null>(null)
  const [animatingCells, setAnimatingCells] = useState<Set<string>>(new Set())
  const [courtOrder, setCourtOrder] = useState<string[]>(state.courts.map(c => c.id))
  const [hoveredCourt, setHoveredCourt] = useState<string | null>(null)
  
  // Update court order when courts change
  useEffect(() => {
    setCourtOrder(state.courts.map(c => c.id))
  }, [state.courts])
  
  // Get ordered courts
  const orderedCourts = courtOrder
    .map(id => state.courts.find(c => c.id === id))
    .filter((court): court is NonNullable<typeof court> => Boolean(court))

  // Generate time slots from 8:00 to 20:00 with 30-minute intervals
  const generateTimeSlots = (): string[] => {
    const slots = []
    for (let hour = 8; hour < 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
      slots.push(`${hour.toString().padStart(2, '0')}:30`)
    }
    return slots
  }

  const timeSlots = generateTimeSlots()
  
  // Court reordering functions
  const moveCourtLeft = (courtId: string) => {
    const index = courtOrder.indexOf(courtId)
    if (index > 0) {
      const newOrder = [...courtOrder]
      ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
      setCourtOrder(newOrder)
    }
  }
  
  const moveCourtRight = (courtId: string) => {
    const index = courtOrder.indexOf(courtId)
    if (index < courtOrder.length - 1) {
      const newOrder = [...courtOrder]
      ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
      setCourtOrder(newOrder)
    }
  }

  // Filter matches for selected date
  const dayMatches = state.matches.filter(match => match.scheduledDate === state.selectedDate)
  const dayBlockers = state.blockers.filter(blocker => blocker.date === state.selectedDate)
  
  // Get court availability from wizard data (mock data for demo)
  // This would normally come from a context or props
  const getCourtAvailability = () => {
    const wizardCourtData: Record<string, Array<{
      courtId: string
      timeSlots: Array<{startTime: string, endTime: string}>
    }>> = {
      '2024-08-15': [
        {
          courtId: 'c3',
          timeSlots: [{ startTime: '14:00', endTime: '20:00' }] // Half day blocked
        },
        {
          courtId: 'c6',
          timeSlots: [
            { startTime: '08:00', endTime: '12:00' },
            { startTime: '16:00', endTime: '20:00' }
          ] // 4 hours blocked (12-16)
        }
      ],
      '2024-08-16': [], // All courts fully available
      '2024-08-17': []  // All courts fully available
    }
    return wizardCourtData[state.selectedDate] || []
  }
  
  // Check if a time slot is available for a specific court
  const isCourtTimeSlotAvailable = (courtId: string, timeSlot: string): boolean => {
    const courtData = getCourtAvailability().find(court => court.courtId === courtId)
    if (!courtData) return true // If no restriction data, assume available
    
    // Check if timeSlot falls within any available time slots
    return courtData.timeSlots.some(slot => {
      return timeSlot >= slot.startTime && timeSlot < slot.endTime
    })
  }

  // Calculate how many slots a match spans
  const getMatchSlotSpan = (match: Match): number => {
    if (!match.estimatedDuration) return 1
    return Math.ceil(match.estimatedDuration / 30) // 30-minute slots
  }
  
  // Check if a time slot is within a match's duration
  const isSlotWithinMatch = (match: Match, timeSlot: string): boolean => {
    if (!match.scheduledTime || !match.estimatedDuration) return false
    
    const matchStart = match.scheduledTime
    const [startHour, startMin] = matchStart.split(':').map(Number)
    const matchEndMinutes = startHour * 60 + startMin + match.estimatedDuration
    
    const [slotHour, slotMin] = timeSlot.split(':').map(Number)
    const slotMinutes = slotHour * 60 + slotMin
    const matchStartMinutes = startHour * 60 + startMin
    
    return slotMinutes >= matchStartMinutes && slotMinutes < matchEndMinutes
  }
  
  // Get match for specific court and time slot (including spanning matches)
  const getMatchForSlot = (courtId: string, timeSlot: string): Match | undefined => {
    // First check for matches starting at this slot
    const directMatch = dayMatches.find(match => 
      match.courtId === courtId && match.scheduledTime === timeSlot
    )
    if (directMatch) return directMatch
    
    // Then check for matches that span into this slot
    return dayMatches.find(match => 
      match.courtId === courtId && isSlotWithinMatch(match, timeSlot)
    )
  }

  // Get blocker for specific court and time slot (deprecated, kept for compatibility)
  const getBlockerForSlot = (courtId: string, timeSlot: string): Blocker | undefined => {
    return dayBlockers.find(blocker => 
      blocker.courtId === courtId && 
      timeSlot >= blocker.startTime && 
      timeSlot < blocker.endTime
    )
  }

  // Check if drop is valid with enhanced conflict detection
  const isValidDrop = (courtId: string, timeSlot: string): boolean => {
    if (!draggedMatch) return false
    
    // Can't drop on same position
    if (draggedMatch.courtId === courtId && draggedMatch.scheduledTime === timeSlot) {
      return false
    }
    
    // Check if court time slot is available
    if (!isCourtTimeSlotAvailable(courtId, timeSlot)) return false
    
    // Legacy blocker check (kept for compatibility)
    const blocker = getBlockerForSlot(courtId, timeSlot)
    if (blocker) return false
    
    // Check if slot already has a match
    const existingMatch = getMatchForSlot(courtId, timeSlot)
    if (existingMatch && existingMatch.id !== draggedMatch.id) return false
    
    // Check for player conflicts
    const hasPlayerConflict = checkPlayerConflict(draggedMatch, timeSlot)
    if (hasPlayerConflict) return false
    
    return true
  }

  // Check for player conflicts at the given time
  const checkPlayerConflict = (match: Match, timeSlot: string): boolean => {
    const playerIds = [match.player1Id, match.player2Id].filter(Boolean)
    
    return dayMatches.some(m => {
      if (m.id === match.id || m.scheduledTime !== timeSlot) return false
      const mPlayerIds = [m.player1Id, m.player2Id].filter(Boolean)
      return playerIds.some(pid => mPlayerIds.includes(pid!))
    })
  }

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, match: Match) => {
    setDraggedMatch(match)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, courtId: string, timeSlot: string) => {
    e.preventDefault()
    
    if (isValidDrop(courtId, timeSlot)) {
      e.dataTransfer.dropEffect = 'move'
      setDragOverCell({ courtId, timeSlot })
    } else {
      e.dataTransfer.dropEffect = 'none'
    }
  }

  const handleDragLeave = () => {
    setDragOverCell(null)
  }

  const handleDrop = (e: React.DragEvent, courtId: string, timeSlot: string) => {
    e.preventDefault()
    setDragOverCell(null)
    
    if (draggedMatch && isValidDrop(courtId, timeSlot)) {
      // Add animation to the cell
      const cellKey = `${courtId}-${timeSlot}`
      setAnimatingCells(prev => new Set(prev).add(cellKey))
      
      moveMatch(draggedMatch.id, courtId, timeSlot)
      checkConflicts()
      
      // Remove animation after delay
      setTimeout(() => {
        setAnimatingCells(prev => {
          const newSet = new Set(prev)
          newSet.delete(cellKey)
          return newSet
        })
      }, 500)
    }
    setDraggedMatch(null)
  }

  const handleDragEnd = () => {
    setDraggedMatch(null)
    setDragOverCell(null)
  }

  // Get cell CSS classes with enhanced visual feedback
  const getCellClasses = (courtId: string, timeSlot: string): string => {
    let classes = 'court-cell h-20 p-1 text-xs transition-all duration-200'
    
    const cellKey = `${courtId}-${timeSlot}`
    const isDragOver = dragOverCell?.courtId === courtId && dragOverCell?.timeSlot === timeSlot
    const isValidDropZone = draggedMatch && isValidDrop(courtId, timeSlot)
    const isInvalidDropZone = draggedMatch && !isValidDrop(courtId, timeSlot)
    const isAnimating = animatingCells.has(cellKey)
    const isCourtAvailable = isCourtTimeSlotAvailable(courtId, timeSlot)
    
    // Gray out unavailable time slots
    if (!isCourtAvailable) {
      classes += ' bg-gray-200 opacity-60 cursor-not-allowed border-dashed border-gray-300'
    } else if (isAnimating) {
      classes += ' animate-pulse bg-green-50'
    } else if (isDragOver && isValidDropZone) {
      classes += ' bg-green-100 border-2 border-green-400 shadow-lg'
    } else if (isDragOver && isInvalidDropZone) {
      classes += ' bg-red-100 border-2 border-red-400'
    } else if (draggedMatch && isValidDropZone) {
      classes += ' bg-blue-50 border-blue-200'
    } else {
      classes += ' bg-white hover:bg-gray-50'
    }
    
    return classes
  }

  // Format match display name
  const formatMatchName = (match: Match): string => {
    if (match.player1Name && match.player2Name) {
      return `${match.player1Name} vs ${match.player2Name}`
    } else if (match.player1Name) {
      return `${match.player1Name} vs TBD`
    } else if (match.player2Name) {
      return `TBD vs ${match.player2Name}`
    }
    return 'TBD vs TBD'
  }

  // Get status color with improved visual hierarchy
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'scheduled': return 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400 shadow-sm hover:shadow-md'
      case 'in-progress': return 'bg-gradient-to-br from-green-100 to-green-200 border-green-400 shadow-md animate-pulse'
      case 'completed': return 'bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 opacity-75'
      case 'postponed': return 'bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 shadow-sm'
      default: return 'bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400 shadow-sm'
    }
  }

  // Get priority icon
  const getPriorityIcon = (priority?: string) => {
    switch (priority) {
      case 'high':
        return <ExclamationTriangleIcon className="w-3 h-3 text-red-600" />
      case 'medium':
        return <ClockIcon className="w-3 h-3 text-yellow-600" />
      case 'low':
        return <CheckCircleIcon className="w-3 h-3 text-green-600" />
      default:
        return null
    }
  }

  return (
    <div className="grid-view-container overflow-auto h-full">
      <div className="min-w-full">
        <table className="tournament-grid w-full">
          <thead className="sticky top-0 bg-gray-100 z-10 shadow-sm">
            <tr>
              <th className="w-20 p-3 text-left font-semibold text-gray-700 border-b-2 border-gray-300">
                Time
              </th>
              {orderedCourts.map((court, index) => (
                <th 
                  key={court.id} 
                  className="min-w-48 p-3 border-b-2 border-gray-300 relative"
                  onMouseEnter={() => setHoveredCourt(court.id)}
                  onMouseLeave={() => setHoveredCourt(null)}
                >
                  <div className="flex items-center justify-center">
                    {/* Left arrow */}
                    {hoveredCourt === court.id && index > 0 && (
                      <button
                        onClick={() => moveCourtLeft(court.id)}
                        className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-all"
                        title="Move court left"
                      >
                        <span className="text-sm">◀</span>
                      </button>
                    )}
                    
                    <div className="flex flex-col items-center">
                      <span className="font-bold text-gray-800">{court.name}</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {court.surface} • {court.indoor ? 'Indoor' : 'Outdoor'}
                        {court.isFinalsCourt && ' • Finals Court'}
                      </span>
                    </div>
                    
                    {/* Right arrow */}
                    {hoveredCourt === court.id && index < orderedCourts.length - 1 && (
                      <button
                        onClick={() => moveCourtRight(court.id)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-all"
                        title="Move court right"
                      >
                        <span className="text-sm">▶</span>
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map((timeSlot) => (
              <tr key={timeSlot} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-2 text-center font-medium text-gray-600 bg-gray-50 sticky left-0 z-5">
                  {timeSlot}
                </td>
                {orderedCourts.map((court) => {
                  const match = getMatchForSlot(court.id, timeSlot)
                  const blocker = getBlockerForSlot(court.id, timeSlot)
                  const isMatchStart = match && match.scheduledTime === timeSlot
                  const matchSpan = match ? getMatchSlotSpan(match) : 1
                  
                  // Skip rendering cell if it's covered by a previous match span
                  if (match && !isMatchStart) {
                    return null // This cell is covered by rowSpan from the match start cell
                  }
                  
                  return (
                    <td
                      key={`${court.id}-${timeSlot}`}
                      className={getCellClasses(court.id, timeSlot)}
                      rowSpan={isMatchStart ? matchSpan : 1}
                      onDragOver={(e) => handleDragOver(e, court.id, timeSlot)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, court.id, timeSlot)}
                    >
                      {match && isMatchStart && (
                        <div
                          className={`match-card rounded-lg border-2 p-2 cursor-move transition-all duration-200 transform ${getStatusColor(match.status)} ${
                            hoveredMatch === match.id ? 'scale-105 z-10' : ''
                          } ${draggedMatch?.id === match.id ? 'opacity-50' : ''}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, match)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedMatch(match)}
                          onMouseEnter={() => setHoveredMatch(match.id)}
                          onMouseLeave={() => setHoveredMatch(null)}
                          title={`${formatMatchName(match)} - ${match.status}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-semibold text-xs truncate flex-1">
                              {match.drawName}
                            </div>
                            {getPriorityIcon(match.priority)}
                          </div>
                          <div className="truncate text-gray-700 text-xs mt-1">
                            {formatMatchName(match)}
                          </div>
                          {/* Match Result Display */}
                          {(match.result || match.score) && (
                            <div className="bg-white/90 rounded px-1 py-0.5 mt-1">
                              <span className="text-xs font-bold text-gray-800">
                                {match.result || match.score}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs font-medium capitalize">
                              {match.status === 'in-progress' && (
                                <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></span>
                              )}
                              {match.status.replace('-', ' ')}
                            </span>
                            {match.estimatedDuration && (
                              <span className="text-xs text-gray-600">
                                {match.estimatedDuration}m
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {!isCourtTimeSlotAvailable(court.id, timeSlot) && !match && !isMatchStart && (
                        <div 
                          className="unavailable-slot bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-400 rounded-lg p-2 text-xs shadow-sm opacity-70"
                          title="Court not available during this time slot"
                        >
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="w-4 h-4 bg-gray-500 rounded-full mx-auto mb-1 opacity-50"></div>
                              <div className="font-medium text-gray-600 text-xs">
                                Not Available
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {blocker && !match && (
                        <div 
                          className="blocker-card bg-gradient-to-br from-red-100 to-red-200 border-2 border-red-400 rounded-lg p-2 text-xs shadow-sm opacity-90"
                          title={`${blocker.title}: ${blocker.description || ''}`}
                        >
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
                            <div className="font-semibold text-red-800 truncate">
                              {blocker.title}
                            </div>
                          </div>
                          <div className="text-red-700 text-xs truncate capitalize mt-1">
                            {blocker.type.replace('-', ' ')}
                          </div>
                          <div className="text-red-600 text-xs font-medium mt-1">
                            {blocker.startTime} - {blocker.endTime}
                          </div>
                        </div>
                      )}
                      
                      {!match && !blocker && isCourtTimeSlotAvailable(court.id, timeSlot) && !isMatchStart && (
                        <div className="h-full w-full" />
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Enhanced Legend and Statistics */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Match Status</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-400 rounded mr-2"></div>
              <span className="text-gray-700">Scheduled</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-br from-green-100 to-green-200 border-2 border-green-400 rounded mr-2">
                <div className="w-2 h-2 bg-green-500 rounded-full m-auto animate-pulse"></div>
              </div>
              <span className="text-gray-700">In Progress</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-400 rounded mr-2 opacity-75"></div>
              <span className="text-gray-700">Completed</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-gradient-to-br from-yellow-100 to-yellow-200 border-2 border-yellow-400 rounded mr-2"></div>
              <span className="text-gray-700">Postponed</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-600">Total Matches:</span>
              <span className="ml-2 font-semibold text-gray-900">{dayMatches.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Scheduled:</span>
              <span className="ml-2 font-semibold text-blue-600">
                {dayMatches.filter(m => m.status === 'scheduled').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">In Progress:</span>
              <span className="ml-2 font-semibold text-green-600">
                {dayMatches.filter(m => m.status === 'in-progress').length}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Completed:</span>
              <span className="ml-2 font-semibold text-gray-600">
                {dayMatches.filter(m => m.status === 'completed').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GridView