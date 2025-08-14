import React, { useState, useMemo } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Match, Blocker } from '../../types/tournament'
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, ClockIcon, MapPinIcon, CalendarDaysIcon, TrophyIcon, ExclamationTriangleIcon, PlayIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

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
    <div className="timeline-view h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Enhanced Timeline Controls */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <ClockIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Tournament Timeline</h3>
                <p className="text-purple-100">Gantt-style schedule visualization</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{dayMatches.length}</div>
              <div className="text-sm text-purple-100">Matches Today</div>
            </div>
          </div>
        </div>
        
        {/* Controls Panel */}
        <div className="p-6 space-y-4 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              {/* Date Info */}
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <CalendarDaysIcon className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-800">
                  {new Date(state.selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
              
              {/* Quick Stats */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-medium">{dayMatches.filter(m => m.status === 'in-progress').length} Live</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">{dayMatches.filter(m => m.status === 'scheduled').length} Scheduled</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700 font-medium">{dayBlockers.length} Blocked</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              {/* Time Range Controls */}
              <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg shadow-sm">
                <label className="text-sm font-bold text-gray-700">Time Range:</label>
                <button
                  onClick={() => adjustTimeRange(timelineConfig.startHour - 1, timelineConfig.endHour)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="Start Earlier"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  {timelineConfig.startHour}:00 - {timelineConfig.endHour}:00
                </span>
                <button
                  onClick={() => adjustTimeRange(timelineConfig.startHour, timelineConfig.endHour + 1)}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  title="End Later"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Enhanced Zoom Controls */}
              <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg shadow-sm">
                <label className="text-sm font-bold text-gray-700">Zoom:</label>
                <button
                  onClick={zoomOut}
                  className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center"
                  title="Zoom Out"
                >
                  <MagnifyingGlassMinusIcon className="w-4 h-4" />
                </button>
                <div className="px-3 py-2 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg">
                  <span className="text-sm font-bold text-purple-800">
                    {Math.round((timelineConfig.cellWidth / 80) * 100)}%
                  </span>
                </div>
                <button
                  onClick={zoomIn}
                  className="p-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 transition-all duration-200 flex items-center justify-center"
                  title="Zoom In"
                >
                  <MagnifyingGlassPlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Legend */}
          <div className="flex justify-center">
            <div className="flex flex-wrap gap-6 text-sm bg-white px-6 py-3 rounded-xl shadow-sm">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-blue-600 rounded-lg shadow-sm"></div>
                <span className="font-medium text-gray-700">Scheduled</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-to-br from-green-400 to-green-600 border-2 border-green-600 rounded-lg shadow-sm relative">
                  <div className="absolute inset-1 bg-green-300 rounded animate-pulse"></div>
                </div>
                <span className="font-medium text-gray-700">In Progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-to-br from-gray-400 to-gray-600 border-2 border-gray-600 rounded-lg shadow-sm"></div>
                <span className="font-medium text-gray-700">Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-to-br from-red-400 to-red-600 border-2 border-red-600 rounded-lg shadow-sm"></div>
                <span className="font-medium text-gray-700">Blocked</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-yellow-600 border-2 border-yellow-600 rounded-lg shadow-sm"></div>
                <span className="font-medium text-gray-700">Postponed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Timeline Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="relative">
          {/* Enhanced Time Header */}
          <div className="sticky top-0 bg-white z-20 border-b-2 border-gray-300 shadow-lg">
            <div className="flex">
              <div className="w-64 p-4 bg-gradient-to-br from-gray-100 to-gray-200 border-r-2 border-gray-300">
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-5 h-5 text-gray-600" />
                  <span className="font-bold text-gray-800">Courts</span>
                </div>
              </div>
              <div className="flex-1 relative bg-gradient-to-r from-blue-50 to-purple-50">
                {/* Enhanced Hour markers */}
                {Array.from({ length: timelineConfig.endHour - timelineConfig.startHour }, (_, i) => {
                  const hour = timelineConfig.startHour + i
                  return (
                    <div
                      key={hour}
                      className="absolute top-0 border-l-2 border-purple-300 h-full flex items-start justify-start pl-3 pt-2"
                      style={{ left: `${i * (60 / timelineConfig.interval) * timelineConfig.cellWidth}px` }}
                    >
                      <div className="bg-white px-3 py-1 rounded-lg shadow-sm border border-purple-200">
                        <span className="text-sm font-bold text-purple-800">
                          {hour.toString().padStart(2, '0')}:00
                        </span>
                      </div>
                    </div>
                  )
                })}
                {/* Enhanced 30-minute markers */}
                {timeSlots.map((slot, index) => (
                  <div
                    key={slot}
                    className={`absolute h-full ${slot.endsWith(':00') ? 'border-l-2 border-purple-300' : 'border-l border-purple-200'}`}
                    style={{ left: `${index * timelineConfig.cellWidth}px`, top: '3rem' }}
                  >
                    {slot.endsWith(':30') && (
                      <div className="bg-white/80 px-2 py-1 rounded text-xs text-purple-700 font-medium mt-1 ml-1 shadow-sm">
                        {slot}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Court Rows */}
          <div className="bg-white">
            {state.courts.map((court, courtIndex) => (
              <div key={court.id} className={`flex border-b-2 border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 ${courtIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                {/* Enhanced Court Label */}
                <div className="w-64 p-6 bg-gradient-to-br from-gray-50 to-gray-100 border-r-2 border-gray-300 flex flex-col justify-center group hover:from-blue-50 hover:to-purple-50 transition-all duration-200">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      court.isFinalsCourt 
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500' 
                        : court.indoor 
                        ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                        : 'bg-gradient-to-br from-green-400 to-green-600'
                    }`}>
                      {court.isFinalsCourt ? '👑' : court.indoor ? '🏠' : '🌤️'}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{court.name}</div>
                      <div className="text-sm space-x-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          court.surface === 'hard' ? 'bg-blue-100 text-blue-800' :
                          court.surface === 'clay' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {court.surface}
                        </span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          court.indoor ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {court.indoor ? 'Indoor' : 'Outdoor'}
                        </span>
                        {court.isFinalsCourt && (
                          <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Finals Court
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Timeline Track */}
                <div
                  className="flex-1 relative h-24 bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-purple-50 transition-all duration-200"
                  style={{ 
                    minWidth: `${timeSlots.length * timelineConfig.cellWidth}px`,
                    backgroundImage: `repeating-linear-gradient(to right, transparent, transparent ${timelineConfig.cellWidth - 1}px, #e5e7eb ${timelineConfig.cellWidth - 1}px, #e5e7eb ${timelineConfig.cellWidth}px)`
                  }}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, court.id)}
                >
                  {/* Enhanced Time grid lines */}
                  {timeSlots.map((slot, index) => (
                    <div
                      key={slot}
                      className={`absolute top-0 h-full transition-colors ${
                        slot.endsWith(':00') 
                          ? 'border-l-2 border-purple-300 hover:border-purple-400' 
                          : 'border-l border-purple-200 hover:border-purple-300'
                      }`}
                      style={{ left: `${index * timelineConfig.cellWidth}px` }}
                    >
                      {slot.endsWith(':00') && (
                        <div className="absolute top-0 left-1 w-2 h-2 bg-purple-400 rounded-full opacity-60"></div>
                      )}
                    </div>
                  ))}

                  {/* Enhanced Matches */}
                  {dayMatches
                    .filter(match => match.courtId === court.id && match.scheduledTime)
                    .map(match => (
                      <div
                        key={match.id}
                        className={`absolute top-3 h-18 rounded-xl border-2 cursor-move shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:z-10 ${getMatchColor(match.status)} text-white text-xs p-3 overflow-hidden group`}
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
                        <div className="flex items-center space-x-1 mb-1">
                          <TrophyIcon className="w-3 h-3 opacity-80" />
                          <div className="font-bold truncate text-xs">
                            {match.drawName}
                          </div>
                        </div>
                        <div className="truncate text-xs opacity-90 font-medium">
                          {formatPlayers(match)}
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <div className="flex items-center space-x-1">
                            {match.status === 'in-progress' && <PlayIcon className="w-3 h-3 animate-pulse" />}
                            {match.status === 'completed' && <CheckCircleIcon className="w-3 h-3" />}
                            {match.priority === 'high' && <ExclamationTriangleIcon className="w-3 h-3 text-yellow-300" />}
                            <span className="text-xs opacity-75 capitalize font-medium">
                              {match.status.replace('-', ' ')}
                            </span>
                          </div>
                          <span className="text-xs opacity-75 font-medium">
                            {match.estimatedDuration || 90}min
                          </span>
                        </div>
                        
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl"></div>
                      </div>
                    ))}

                  {/* Enhanced Blockers */}
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
                          className={`absolute top-3 h-18 rounded-xl border-2 text-white text-xs p-3 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 ${getBlockerColor(blocker.type)} group`}
                          style={{
                            left: `${startPos}px`,
                            width: `${width}px`
                          }}
                          title={`${blocker.title}: ${blocker.description || ''} (${blocker.startTime} - ${blocker.endTime})`}
                        >
                          <div className="flex items-center space-x-1 mb-1">
                            <ExclamationTriangleIcon className="w-3 h-3" />
                            <div className="font-bold truncate text-xs">
                              {blocker.title}
                            </div>
                          </div>
                          <div className="truncate text-xs opacity-90 font-medium capitalize">
                            {blocker.type.replace('-', ' ')}
                          </div>
                          <div className="text-xs opacity-75 font-bold">
                            {blocker.startTime} - {blocker.endTime}
                          </div>
                          
                          {/* Diagonal stripes pattern */}
                          <div className="absolute inset-0 opacity-20">
                            <div className="w-full h-full bg-gradient-to-br from-transparent via-white to-transparent transform rotate-45"></div>
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

      {/* Enhanced Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-t-2 border-gray-200 shadow-inner">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <TrophyIcon className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-bold text-gray-800">
                <span className="text-purple-600">{dayMatches.length}</span> matches
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
              <span className="text-sm font-bold text-gray-800">
                <span className="text-red-600">{dayBlockers.length}</span> blockers
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-bold text-gray-800">
                <span className="text-blue-600">{timelineConfig.endHour - timelineConfig.startHour}</span> hours
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
              <span className="font-medium text-gray-700">Range: </span>
              <span className="font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                {timelineConfig.startHour}:00 - {timelineConfig.endHour}:00
              </span>
            </div>
            <div className="bg-white px-3 py-2 rounded-lg shadow-sm">
              <span className="font-medium text-gray-700">Zoom: </span>
              <span className="font-bold text-purple-600">
                {Math.round((timelineConfig.cellWidth / 80) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineView