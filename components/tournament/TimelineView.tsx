import React, { useState, useMemo } from 'react'
import { useTournament, getDrawColor } from '../../contexts/TournamentContext'
import { Match, Blocker, MatchStatus } from '../../types/tournament'
import { ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon, CheckCircleIcon, ClockIcon, PlayIcon, PauseIcon, ExclamationTriangleIcon, MapPinIcon, CalendarDaysIcon, TrophyIcon, ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon } from '@heroicons/react/24/outline'

interface TimelineConfig {
  startHour: number
  endHour: number
  interval: number // minutes
  cellWidth: number
  hourHeight: number
}

type SortField = 'time' | 'court' | 'draw' | 'drawModel' | 'gameType' | 'players' | 'status'
type SortDirection = 'asc' | 'desc'
type ColorMode = 'status' | 'draw'

const TimelineView: React.FC = () => {
  const { state, moveMatch, setSelectedMatch } = useTournament()
  const [draggedMatch, setDraggedMatch] = useState<Match | null>(null)
  const [colorMode, setColorMode] = useState<ColorMode>('status')
  const [filterStatus, setFilterStatus] = useState<MatchStatus | 'all'>('all')
  const [filterDraw, setFilterDraw] = useState<string>('all')
  const [filterGameType, setFilterGameType] = useState<'Singles' | 'Doubles' | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  
  // Get tournament timeframe from wizard data
  const getTournamentTimeframe = () => {
    // Wizard court availability data structure (mock data matching wizard configuration)
    const wizardData = {
      courtsByDay: {
        '2024-08-15': [
          { timeSlots: [{ startTime: '14:00', endTime: '20:00' }] }, // Court 3
          { timeSlots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '16:00', endTime: '20:00' }] } // Practice Court
        ],
        '2024-08-16': [
          { timeSlots: [{ startTime: '08:00', endTime: '20:00' }] }, // Court 3
          { timeSlots: [{ startTime: '08:00', endTime: '20:00' }] }  // Practice Court
        ],
        '2024-08-17': [
          { timeSlots: [{ startTime: '08:00', endTime: '20:00' }] }, // Court 3
          { timeSlots: [{ startTime: '08:00', endTime: '20:00' }] }  // Practice Court
        ]
      }
    }

    let earliestStart = '24:00'
    let latestEnd = '00:00'

    // Iterate through all days and courts to find min/max times
    Object.values(wizardData.courtsByDay).forEach(courts => {
      courts.forEach(court => {
        court.timeSlots.forEach(slot => {
          if (slot.startTime < earliestStart) earliestStart = slot.startTime
          if (slot.endTime > latestEnd) latestEnd = slot.endTime
        })
      })
    })

    // Convert to hours
    const startHour = parseInt(earliestStart.split(':')[0])
    const endHour = parseInt(latestEnd.split(':')[0])

    return { startHour, endHour }
  }

  // Get initial timeframe from wizard data
  const wizardTimeframe = getTournamentTimeframe()
  
  const [timelineConfig, setTimelineConfig] = useState<TimelineConfig>({
    startHour: wizardTimeframe.startHour,
    endHour: wizardTimeframe.endHour,
    interval: 30,
    cellWidth: 80,
    hourHeight: 60
  })

  // Get all tournament days and matches (no date filter)
  const tournamentDays = useMemo(() => {
    const allDates = state.matches
      .map(match => match.scheduledDate)
      .filter((date): date is string => Boolean(date))
      .filter((date, index, arr) => arr.indexOf(date) === index)
      .sort()
    return allDates
  }, [state.matches])

  // Filter matches for entire tournament
  const filteredMatches = useMemo(() => {
    let filtered = state.matches.filter(match => match.scheduledDate && match.scheduledTime)

    // Apply filters
    if (filterStatus !== 'all') {
      filtered = filtered.filter(match => match.status === filterStatus)
    }
    
    if (filterDraw !== 'all') {
      filtered = filtered.filter(match => match.drawName === filterDraw)
    }

    if (filterGameType !== 'all') {
      filtered = filtered.filter(match => match.gameType === filterGameType)
    }

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(match => 
        match.player1Name?.toLowerCase().includes(search) ||
        match.player2Name?.toLowerCase().includes(search) ||
        match.drawName.toLowerCase().includes(search) ||
        match.courtName?.toLowerCase().includes(search)
      )
    }

    return filtered
  }, [state.matches, filterStatus, filterDraw, filterGameType, searchTerm])

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
    
    const courtMatches = filteredMatches.filter(m => m.courtId === courtId && m.id !== match.id)
    
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


  // Get match color based on mode
  const getMatchColor = (match: Match): string => {
    if (colorMode === 'status') {
      // Softer status-based colors for better visual appeal
      switch (match.status) {
        case 'scheduled': return 'bg-blue-200 border-blue-400 text-blue-900'
        case 'in-progress': return 'bg-green-200 border-green-400 text-green-900'
        case 'completed': return 'bg-gray-200 border-gray-400 text-gray-800'
        case 'postponed': return 'bg-yellow-200 border-yellow-400 text-yellow-900'
        case 'walkover': return 'bg-red-200 border-red-400 text-red-900'
        default: return 'bg-blue-200 border-blue-400 text-blue-900'
      }
    } else {
      // Color by draw - use centralized color mapping for consistency
      return getDrawColor(match.drawId)
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

  // Get matches for a specific day
  const getMatchesForDay = (date: string) => {
    return filteredMatches.filter(match => match.scheduledDate === date)
  }

  // Get matches for a specific day and court
  const getMatchesForDayAndCourt = (date: string, courtId: string) => {
    return getMatchesForDay(date).filter(match => match.courtId === courtId)
  }

  // Calculate vertical position for overlapping matches
  const getMatchVerticalPosition = (match: Match, date: string, courtId: string) => {
    const courtMatches = getMatchesForDayAndCourt(date, courtId)
      .filter(m => m.scheduledTime)
      .sort((a, b) => a.scheduledTime!.localeCompare(b.scheduledTime!))
    
    let level = 0
    const matchStart = getTimePosition(match.scheduledTime!)
    const matchEnd = matchStart + getMatchWidth(match)
    
    for (const otherMatch of courtMatches) {
      if (otherMatch.id === match.id) break
      
      const otherStart = getTimePosition(otherMatch.scheduledTime!)
      const otherEnd = otherStart + getMatchWidth(otherMatch)
      
      if (matchStart < otherEnd && matchEnd > otherStart) {
        level++
      }
    }
    
    return level * 48 // 48px per level to account for match height + spacing
  }

  return (
    <div className="timeline-view h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        {/* Header Stats */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Tournament Overview: {filteredMatches.length} matches across {tournamentDays.length} days</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">{filteredMatches.filter(m => m.status === 'completed').length} completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <PlayIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">{filteredMatches.filter(m => m.status === 'in-progress').length} in progress</span>
              </div>
              <div className="flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-gray-600">{filteredMatches.filter(m => m.status === 'scheduled').length} scheduled</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Filters and Controls */}
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-80">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search players, courts, or match details..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as MatchStatus | 'all')}
                  className="pl-9 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="walkover">Walkover</option>
                </select>
              </div>

              <select
                value={filterDraw}
                onChange={(e) => setFilterDraw(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-medium"
              >
                <option value="all">All Draws</option>
                {Array.from(new Set(state.matches.map(match => match.drawName)))
                  .sort()
                  .map(drawName => (
                    <option key={drawName} value={drawName}>{drawName}</option>
                  ))}
              </select>
              
              <select
                value={filterGameType}
                onChange={(e) => setFilterGameType(e.target.value as 'Singles' | 'Doubles' | 'all')}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-medium"
              >
                <option value="all">All Game Types</option>
                <option value="Singles">Singles</option>
                <option value="Doubles">Doubles</option>
              </select>
              
              <select
                value={colorMode}
                onChange={(e) => setColorMode(e.target.value as ColorMode)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-medium"
              >
                <option value="status">Color by Status</option>
                <option value="draw">Color by Draw</option>
              </select>
              
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('all')
                  setFilterDraw('all')
                  setFilterGameType('all')
                }}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center space-x-2"
                title="Clear all filters"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Timeline Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">

              {/* Zoom Controls */}
              <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg shadow-sm border">
                <label className="text-sm font-bold text-gray-700">Zoom:</label>
                <button
                  onClick={zoomOut}
                  className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  title="Zoom Out"
                >
                  <MagnifyingGlassMinusIcon className="w-4 h-4" />
                </button>
                <div className="px-3 py-1 bg-blue-50 rounded">
                  <span className="text-sm font-bold text-blue-600">
                    {Math.round((timelineConfig.cellWidth / 80) * 100)}%
                  </span>
                </div>
                <button
                  onClick={zoomIn}
                  className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  title="Zoom In"
                >
                  <MagnifyingGlassPlusIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Day-based Timeline Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="relative">
          {/* Time Header */}
          <div className="sticky top-0 bg-white z-50 border-b border-gray-200 shadow-sm">
            <div className="flex">
              <div className="p-4 bg-gray-50 border-r border-gray-200 flex-shrink-0 sticky left-0" style={{ width: '160px', minWidth: '160px', maxWidth: '160px', zIndex: 60 }}>
                <div className="flex items-center space-x-2">
                  <CalendarDaysIcon className="w-5 h-5 text-gray-600" />
                  <span className="font-bold text-gray-800">Tournament Days</span>
                </div>
              </div>
              <div className="p-4 bg-gray-100 border-r border-gray-200 flex-shrink-0 sticky" style={{ width: '120px', minWidth: '120px', maxWidth: '120px', left: '160px', zIndex: 60 }}>
                <div className="flex items-center space-x-2">
                  <MapPinIcon className="w-5 h-5 text-gray-600" />
                  <span className="font-bold text-gray-800">Courts</span>
                </div>
              </div>
              <div className="flex-1 relative bg-gray-50" style={{ marginLeft: '0px' }}>
                {/* Hour markers */}
                {Array.from({ length: timelineConfig.endHour - timelineConfig.startHour }, (_, i) => {
                  const hour = timelineConfig.startHour + i
                  return (
                    <div
                      key={hour}
                      className="absolute top-0 border-l border-gray-300 h-full flex items-start justify-start pl-2 pt-2 z-0"
                      style={{ left: `${i * (60 / timelineConfig.interval) * timelineConfig.cellWidth}px` }}
                    >
                      <div className="bg-white px-2 py-1 rounded shadow-sm border">
                        <span className="text-xs font-bold text-gray-700">
                          {hour.toString().padStart(2, '0')}:00
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Day Rows */}
          <div className="bg-white">
            {tournamentDays.map((date, dayIndex) => {
              const dayMatches = getMatchesForDay(date)
              const dayBlockers = state.blockers.filter(blocker => blocker.date === date)
              
              return (
                <div key={date}>
                  {/* Day Separator - Visual break between days */}
                  {dayIndex > 0 && (
                    <div className="bg-gradient-to-r from-blue-100 via-purple-100 to-blue-100 border-t-4 border-blue-300 border-b border-gray-300">
                      <div className="flex items-center justify-center py-2">
                        <div className="flex items-center space-x-2 bg-white px-4 py-1 rounded-full shadow-sm border">
                          <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-bold text-blue-800">Day Separator</span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className={`border-b border-gray-200 ${dayIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                    {/* Day container with proper spanning */}
                    <div className="flex">
                      {/* Day info column spanning full height */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-r border-gray-200 flex flex-col justify-center sticky left-0 shadow-sm flex-shrink-0" style={{ width: '160px', minWidth: '160px', maxWidth: '160px', zIndex: 55 }}>
                        <div className="flex items-center space-x-2 mb-1">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div className="font-bold text-gray-900 text-lg">
                            {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 font-medium space-y-1">
                          <div>{dayMatches.length} matches</div>
                          <div>{state.courts.length} courts</div>
                        </div>
                      </div>
                      
                      {/* Courts and timeline container */}
                      <div className="flex-1">
                        {/* Courts as rows for this day */}
                        {state.courts.map((court, courtIndex) => {
                          const courtMatches = getMatchesForDayAndCourt(date, court.id)
                          const courtBlockers = dayBlockers.filter(blocker => blocker.courtId === court.id)
                          
                          return (
                            <div key={`${date}-${court.id}`} className="flex border-b border-gray-100">
                              {/* Court info column - now sticky */}
                              <div className="p-2 bg-gray-50 border-r border-gray-200 flex flex-col justify-center sticky left-0 shadow-sm flex-shrink-0" style={{ 
                                width: '120px', 
                                minWidth: '120px', 
                                maxWidth: '120px', 
                                left: '160px', 
                                zIndex: 55,
                                minHeight: '60px',
                                height: `${Math.max(60, courtMatches.reduce((max, match) => {
                                  const pos = getMatchVerticalPosition(match, date, court.id)
                                  return Math.max(max, pos + 48)
                                }, 60))}px`
                              }}>
                                <div className="font-bold text-gray-900 text-sm">{court.name}</div>
                                <div className="text-xs text-gray-600">{courtMatches.length} matches</div>
                              </div>
                              
                              {/* Timeline content for this court - dynamic height based on overlapping matches */}
                              <div className="flex-1 relative z-0 bg-white" style={{ 
                                minWidth: `${timeSlots.length * timelineConfig.cellWidth}px`,
                                minHeight: '60px',
                                height: `${Math.max(60, courtMatches.reduce((max, match) => {
                                  const pos = getMatchVerticalPosition(match, date, court.id)
                                  return Math.max(max, pos + 48)
                                }, 60))}px`
                              }}>
                            {/* Time grid */}
                            {timeSlots.map((slot, index) => (
                              <div
                                key={slot}
                                className={`absolute top-0 h-full ${
                                  slot.endsWith(':00') 
                                    ? 'border-l border-gray-300' 
                                    : 'border-l border-gray-200'
                                }`}
                                style={{ left: `${index * timelineConfig.cellWidth}px` }}
                              />
                            ))}

                            {/* Matches in this court/day */}
                            {courtMatches.map(match => {
                              const verticalPos = getMatchVerticalPosition(match, date, court.id)
                              return (
                                <div
                                  key={match.id}
                                  className={`absolute rounded border cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 text-xs p-2 ${getMatchColor(match)}`}
                                  style={{
                                    left: `${getTimePosition(match.scheduledTime!)}px`,
                                    width: `${Math.max(getMatchWidth(match), 140)}px`,
                                    top: `${2 + verticalPos}px`,
                                    height: '44px'
                                  }}
                                  onClick={() => setSelectedMatch(match)}
                                  title={`${match.drawName} - ${formatPlayers(match)} - ${match.status}`}
                                >
                                  <div className="flex flex-col h-full">
                                    {/* First row: Draw name and status */}
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-xs">
                                        {match.drawName}
                                      </span>
                                      <div className="flex items-center space-x-1 flex-shrink-0">
                                        {match.status === 'in-progress' && <PlayIcon className="w-3 h-3 animate-pulse" />}
                                        {match.status === 'completed' && <CheckCircleIcon className="w-3 h-3" />}
                                        {match.status === 'scheduled' && <ClockIcon className="w-3 h-3" />}
                                        {match.status === 'postponed' && <PauseIcon className="w-3 h-3" />}
                                      </div>
                                    </div>
                                    {/* Second row: Players */}
                                    <div className="text-xs text-gray-700">
                                      {formatPlayers(match)}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}

                            {/* Blockers in this court/day */}
                            {courtBlockers.map(blocker => {
                              const startPos = getTimePosition(blocker.startTime)
                              const endTime = blocker.endTime
                              const [endHour, endMin] = endTime.split(':').map(Number)
                              const [startHour, startMin] = blocker.startTime.split(':').map(Number)
                              const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin)
                              const width = getDurationWidth(durationMinutes)

                              return (
                                <div
                                  key={blocker.id}
                                  className={`absolute top-2 h-12 rounded border-2 text-white text-xs p-2 overflow-hidden shadow-sm ${getBlockerColor(blocker.type)}`}
                                  style={{
                                    left: `${startPos}px`,
                                    width: `${width}px`
                                  }}
                                  title={`${blocker.title}: ${blocker.description || ''} (${blocker.startTime} - ${blocker.endTime})`}
                                >
                                  <div className="font-bold truncate">
                                    {blocker.title}
                                  </div>
                                  <div className="text-xs opacity-75">
                                    {blocker.startTime} - {blocker.endTime}
                                  </div>
                                </div>
                              )
                            })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 shadow-inner">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-700">
                Showing <span className="font-bold text-blue-600">{filteredMatches.length}</span> of <span className="font-bold">{state.matches.filter(m => m.scheduledTime).length}</span> matches
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-700">
                <span className="font-bold text-green-600">{tournamentDays.length}</span> tournament days
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Color Mode: {colorMode === 'status' ? 'By Status' : 'By Draw'}</span>
            <span>•</span>
            <span>View: Timeline</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineView