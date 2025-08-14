import React, { useState, useMemo } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Match, Blocker } from '../../types/tournament'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface TimelineConfig {
  startHour: number
  endHour: number
  interval: number // minutes
  cellWidth: number
  hourHeight: number
}

const TimelineView: React.FC = () => {
  const { state, moveMatch, setSelectedMatch } = useTournament()
  const [draggedMatch, setDraggedMatch] = useState<Match | null>(null)
  const [timelineConfig, setTimelineConfig] = useState<TimelineConfig>({
    startHour: 8,
    endHour: 20,
    interval: 30,
    cellWidth: 80,
    hourHeight: 60
  })

  // Filter matches and blockers for selected date
  const dayMatches = state.matches.filter(match => match.scheduledDate === state.selectedDate)
  const dayBlockers = state.blockers.filter(blocker => blocker.date === state.selectedDate)

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = timelineConfig.startHour; hour < timelineConfig.endHour; hour++) {
      for (let minute = 0; minute < 60; minute += timelineConfig.interval) {
        slots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
      }
    }
    return slots
  }, [timelineConfig])

  // Get position for time
  const getTimePosition = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes
    const startMinutes = timelineConfig.startHour * 60
    return ((totalMinutes - startMinutes) / timelineConfig.interval) * timelineConfig.cellWidth
  }

  // Get duration width
  const getDurationWidth = (duration: number) => {
    return (duration / timelineConfig.interval) * timelineConfig.cellWidth
  }

  // Get match width
  const getMatchWidth = (match: Match) => {
    const duration = match.estimatedDuration || 90
    return getDurationWidth(duration)
  }

  // Check for overlaps
  const checkOverlap = (match: Match, courtId: string, time: string): boolean => {
    const matchStart = getTimePosition(time)
    const matchEnd = matchStart + getMatchWidth(match)
    
    const courtMatches = dayMatches.filter(m => m.courtId === courtId && m.id !== match.id)
    
    return courtMatches.some(existingMatch => {
      if (!existingMatch.scheduledTime) return false
      
      const existingStart = getTimePosition(existingMatch.scheduledTime)
      const existingEnd = existingStart + getMatchWidth(existingMatch)
      
      return (matchStart < existingEnd && matchEnd > existingStart)
    })
  }

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, match: Match) => {
    setDraggedMatch(match)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, courtId: string) => {
    e.preventDefault()
    
    if (!draggedMatch) return
    
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const timeIndex = Math.floor(x / timelineConfig.cellWidth)
    const newTime = timeSlots[timeIndex]
    
    if (newTime && !checkOverlap(draggedMatch, courtId, newTime)) {
      moveMatch(draggedMatch.id, courtId, newTime)
    }
    
    setDraggedMatch(null)
  }

  const handleDragEnd = () => {
    setDraggedMatch(null)
  }

  // Zoom controls
  const zoomIn = () => {
    setTimelineConfig(prev => ({
      ...prev,
      cellWidth: Math.min(prev.cellWidth + 20, 200)
    }))
  }

  const zoomOut = () => {
    setTimelineConfig(prev => ({
      ...prev,
      cellWidth: Math.max(prev.cellWidth - 20, 40)
    }))
  }

  // Time range controls
  const adjustTimeRange = (startHour: number, endHour: number) => {
    setTimelineConfig(prev => ({
      ...prev,
      startHour: Math.max(startHour, 6),
      endHour: Math.min(endHour, 24)
    }))
  }

  // Get status color for matches
  const getMatchColor = (status: string): string => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500 border-blue-600'
      case 'in-progress': return 'bg-green-500 border-green-600'
      case 'completed': return 'bg-gray-400 border-gray-500'
      case 'postponed': return 'bg-yellow-500 border-yellow-600'
      default: return 'bg-blue-500 border-blue-600'
    }
  }

  // Get blocker color
  const getBlockerColor = (type: string): string => {
    switch (type) {
      case 'maintenance': return 'bg-red-400 border-red-500'
      case 'reserved': return 'bg-purple-400 border-purple-500'
      case 'unavailable': return 'bg-gray-500 border-gray-600'
      default: return 'bg-orange-400 border-orange-500'
    }
  }

  // Format player names
  const formatPlayers = (match: Match): string => {
    if (match.player1Name && match.player2Name) {
      return `${match.player1Name} vs ${match.player2Name}`
    } else if (match.player1Name) {
      return `${match.player1Name} vs TBD`
    } else if (match.player2Name) {
      return `TBD vs ${match.player2Name}`
    }
    return 'TBD vs TBD'
  }

  return (
    <div className="timeline-view h-full flex flex-col bg-gray-50">
      {/* Timeline Controls */}
      <div className="bg-white p-4 border-b border-gray-200 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Tournament Timeline</h3>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Controls */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Time Range:</label>
              <button
                onClick={() => adjustTimeRange(timelineConfig.startHour - 1, timelineConfig.endHour)}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="Start Earlier"
              >
                <ChevronLeftIcon className="w-4 h-4" />
              </button>
              <span className="text-sm font-medium">
                {timelineConfig.startHour}:00 - {timelineConfig.endHour}:00
              </span>
              <button
                onClick={() => adjustTimeRange(timelineConfig.startHour, timelineConfig.endHour + 1)}
                className="p-1 text-gray-500 hover:text-gray-700"
                title="End Later"
              >
                <ChevronRightIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Zoom:</label>
              <button
                onClick={zoomOut}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                -
              </button>
              <span className="text-sm font-medium w-8 text-center">
                {Math.round((timelineConfig.cellWidth / 80) * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 border border-blue-600 rounded mr-2"></div>
            <span>Scheduled</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 border border-green-600 rounded mr-2"></div>
            <span>In Progress</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-400 border border-gray-500 rounded mr-2"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-400 border border-red-500 rounded mr-2"></div>
            <span>Blocked</span>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div className="flex-1 overflow-auto">
        <div className="relative">
          {/* Time Header */}
          <div className="sticky top-0 bg-white z-20 border-b border-gray-300">
            <div className="flex">
              <div className="w-48 p-2 bg-gray-100 border-r border-gray-300">
                <span className="font-semibold text-gray-700">Court</span>
              </div>
              <div className="flex-1 relative">
                {/* Hour markers */}
                {Array.from({ length: timelineConfig.endHour - timelineConfig.startHour }, (_, i) => {
                  const hour = timelineConfig.startHour + i
                  return (
                    <div
                      key={hour}
                      className="absolute top-0 border-l border-gray-400 h-full flex items-center justify-start pl-2"
                      style={{ left: `${i * (60 / timelineConfig.interval) * timelineConfig.cellWidth}px` }}
                    >
                      <span className="text-sm font-medium text-gray-700">
                        {hour.toString().padStart(2, '0')}:00
                      </span>
                    </div>
                  )
                })}
                {/* 30-minute markers */}
                {timeSlots.map((slot, index) => (
                  <div
                    key={slot}
                    className={`absolute top-6 h-4 ${slot.endsWith(':00') ? 'border-l-2 border-gray-300' : 'border-l border-gray-200'}`}
                    style={{ left: `${index * timelineConfig.cellWidth}px` }}
                  >
                    {slot.endsWith(':30') && (
                      <span className="text-xs text-gray-500 ml-1">{slot}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Court Rows */}
          <div className="bg-white">
            {state.courts.map((court, courtIndex) => (
              <div key={court.id} className="flex border-b border-gray-200">
                {/* Court Label */}
                <div className="w-48 p-4 bg-gray-50 border-r border-gray-300 flex flex-col justify-center">
                  <div className="font-semibold text-gray-800">{court.name}</div>
                  <div className="text-sm text-gray-500">
                    {court.surface} • {court.indoor ? 'Indoor' : 'Outdoor'}
                    {court.isFinalsCourt && ' • Finals'}
                  </div>
                </div>

                {/* Timeline Track */}
                <div
                  className="flex-1 relative h-20 bg-white"
                  style={{ 
                    minWidth: `${timeSlots.length * timelineConfig.cellWidth}px`,
                    backgroundImage: `repeating-linear-gradient(to right, transparent, transparent ${timelineConfig.cellWidth - 1}px, #e5e7eb ${timelineConfig.cellWidth - 1}px, #e5e7eb ${timelineConfig.cellWidth}px)`
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, court.id)}
                >
                  {/* Time grid lines */}
                  {timeSlots.map((slot, index) => (
                    <div
                      key={slot}
                      className={`absolute top-0 h-full ${slot.endsWith(':00') ? 'border-l-2 border-gray-300' : 'border-l border-gray-100'}`}
                      style={{ left: `${index * timelineConfig.cellWidth}px` }}
                    />
                  ))}

                  {/* Matches */}
                  {dayMatches
                    .filter(match => match.courtId === court.id && match.scheduledTime)
                    .map(match => (
                      <div
                        key={match.id}
                        className={`absolute top-2 h-16 rounded border-2 cursor-move shadow-sm hover:shadow-md transition-all ${getMatchColor(match.status)} text-white text-xs p-2 overflow-hidden`}
                        style={{
                          left: `${getTimePosition(match.scheduledTime!)}px`,
                          width: `${getMatchWidth(match)}px`
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, match)}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedMatch(match)}
                        title={`${match.drawName} - ${formatPlayers(match)} - ${match.status}`}
                      >
                        <div className="font-medium truncate text-xs">
                          {match.drawName}
                        </div>
                        <div className="truncate text-xs opacity-90">
                          {formatPlayers(match)}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs opacity-75 capitalize">
                            {match.status}
                          </span>
                          <span className="text-xs opacity-75">
                            {match.estimatedDuration || 90}min
                          </span>
                        </div>
                      </div>
                    ))}

                  {/* Blockers */}
                  {dayBlockers
                    .filter(blocker => blocker.courtId === court.id)
                    .map(blocker => {
                      const startPos = getTimePosition(blocker.startTime)
                      const endTime = blocker.endTime
                      const [endHour, endMin] = endTime.split(':').map(Number)
                      const [startHour, startMin] = blocker.startTime.split(':').map(Number)
                      const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
                      const width = getDurationWidth(durationMinutes)

                      return (
                        <div
                          key={blocker.id}
                          className={`absolute top-2 h-16 rounded border-2 text-white text-xs p-2 overflow-hidden opacity-80 ${getBlockerColor(blocker.type)}`}
                          style={{
                            left: `${startPos}px`,
                            width: `${width}px`
                          }}
                          title={`${blocker.title}: ${blocker.description || ''} (${blocker.startTime} - ${blocker.endTime})`}
                        >
                          <div className="font-medium truncate text-xs">
                            {blocker.title}
                          </div>
                          <div className="truncate text-xs opacity-90">
                            {blocker.type}
                          </div>
                          <div className="text-xs opacity-75">
                            {blocker.startTime} - {blocker.endTime}
                          </div>
                        </div>
                      )
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 p-3 border-t border-gray-200 text-sm text-gray-600">
        <div className="flex justify-between items-center">
          <span>
            {dayMatches.length} matches • {dayBlockers.length} blockers
          </span>
          <span>
            Time range: {timelineConfig.startHour}:00 - {timelineConfig.endHour}:00 
            ({timelineConfig.endHour - timelineConfig.startHour} hours)
          </span>
        </div>
      </div>
    </div>
  )
}

export default TimelineView