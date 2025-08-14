import React, { useState, useRef } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Match, Blocker } from '../../types/tournament'

const GridView: React.FC = () => {
  const { state, moveMatch, setSelectedMatch } = useTournament()
  const [draggedMatch, setDraggedMatch] = useState<Match | null>(null)
  const [dragOverCell, setDragOverCell] = useState<{ courtId: string; timeSlot: string } | null>(null)

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

  // Filter matches for selected date
  const dayMatches = state.matches.filter(match => match.scheduledDate === state.selectedDate)
  const dayBlockers = state.blockers.filter(blocker => blocker.date === state.selectedDate)

  // Get match for specific court and time slot
  const getMatchForSlot = (courtId: string, timeSlot: string): Match | undefined => {
    return dayMatches.find(match => 
      match.courtId === courtId && match.scheduledTime === timeSlot
    )
  }

  // Get blocker for specific court and time slot
  const getBlockerForSlot = (courtId: string, timeSlot: string): Blocker | undefined => {
    return dayBlockers.find(blocker => 
      blocker.courtId === courtId && 
      timeSlot >= blocker.startTime && 
      timeSlot < blocker.endTime
    )
  }

  // Check if drop is valid
  const isValidDrop = (courtId: string, timeSlot: string): boolean => {
    if (!draggedMatch) return false
    
    // Can&apos;t drop on same position
    if (draggedMatch.courtId === courtId && draggedMatch.scheduledTime === timeSlot) {
      return false
    }
    
    // Check if slot is blocked
    const blocker = getBlockerForSlot(courtId, timeSlot)
    if (blocker) return false
    
    // Check if slot already has a match
    const existingMatch = getMatchForSlot(courtId, timeSlot)
    if (existingMatch && existingMatch.id !== draggedMatch.id) return false
    
    return true
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
      moveMatch(draggedMatch.id, courtId, timeSlot)
    }
    setDraggedMatch(null)
  }

  const handleDragEnd = () => {
    setDraggedMatch(null)
    setDragOverCell(null)
  }

  // Get cell CSS classes
  const getCellClasses = (courtId: string, timeSlot: string): string => {
    let classes = 'court-cell h-16 p-1 text-xs'
    
    const isDragOver = dragOverCell?.courtId === courtId && dragOverCell?.timeSlot === timeSlot
    const isValidDropZone = draggedMatch && isValidDrop(courtId, timeSlot)
    const isInvalidDropZone = draggedMatch && !isValidDrop(courtId, timeSlot)
    
    if (isDragOver && isValidDropZone) {
      classes += ' drag-over'
    } else if (isDragOver && isInvalidDropZone) {
      classes += ' drag-invalid'
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

  // Get status color
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 border-blue-300'
      case 'in-progress': return 'bg-green-100 border-green-300'
      case 'completed': return 'bg-gray-100 border-gray-300'
      case 'postponed': return 'bg-yellow-100 border-yellow-300'
      default: return 'bg-blue-100 border-blue-300'
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
              {state.courts.map((court) => (
                <th key={court.id} className="min-w-48 p-3 border-b-2 border-gray-300">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-gray-800">{court.name}</span>
                    <span className="text-xs text-gray-500 capitalize">
                      {court.surface} • {court.indoor ? 'Indoor' : 'Outdoor'}
                      {court.isFinalsCourt && ' • Finals Court'}
                    </span>
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
                {state.courts.map((court) => {
                  const match = getMatchForSlot(court.id, timeSlot)
                  const blocker = getBlockerForSlot(court.id, timeSlot)
                  
                  return (
                    <td
                      key={`${court.id}-${timeSlot}`}
                      className={getCellClasses(court.id, timeSlot)}
                      onDragOver={(e) => handleDragOver(e, court.id, timeSlot)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, court.id, timeSlot)}
                    >
                      {match && (
                        <div
                          className={`match-card ${getStatusColor(match.status)} text-xs cursor-move`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, match)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedMatch(match)}
                          title={`${formatMatchName(match)} - ${match.status}`}
                        >
                          <div className="font-medium truncate">
                            {match.drawName}
                          </div>
                          <div className="truncate text-gray-700">
                            {formatMatchName(match)}
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-600 capitalize">
                              {match.status}
                            </span>
                            {match.estimatedDuration && (
                              <span className="text-xs text-gray-500">
                                {match.estimatedDuration}min
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {blocker && !match && (
                        <div 
                          className="blocker-card text-xs"
                          title={`${blocker.title}: ${blocker.description || ''}`}
                        >
                          <div className="font-medium text-red-700 truncate">
                            {blocker.title}
                          </div>
                          <div className="text-red-600 text-xs truncate">
                            {blocker.type}
                          </div>
                          <div className="text-red-500 text-xs">
                            {blocker.startTime} - {blocker.endTime}
                          </div>
                        </div>
                      )}
                      
                      {!match && !blocker && (
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
      
      {/* Legend */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-700 mb-2">Legend</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-300 rounded mr-2"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded mr-2"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded mr-2"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded mr-2"></div>
            <span>Blocked</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GridView