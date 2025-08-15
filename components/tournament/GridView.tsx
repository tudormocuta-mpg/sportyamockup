import React, { useState, useEffect } from 'react'
import { useTournament, getDrawColor } from '../../contexts/TournamentContext'
import { Match, Blocker } from '../../types/tournament'
import { ExclamationTriangleIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline'

const GridView: React.FC = () => {
  const { state, moveMatch, setSelectedMatch, checkConflicts, setSelectedDate, setLastRefreshTime } = useTournament()
  const [draggedMatch, setDraggedMatch] = useState<Match | null>(null)
  const [dragOverCell, setDragOverCell] = useState<{ courtId: string; timeSlot: string } | null>(null)
  const [dragOverMatch, setDragOverMatch] = useState<Match | null>(null)
  const [dragMode, setDragMode] = useState<'move' | 'swap' | 'invalid'>('move')
  const [hoveredMatch, setHoveredMatch] = useState<string | null>(null)
  const [animatingCells, setAnimatingCells] = useState<Set<string>>(new Set())
  const [courtOrder, setCourtOrder] = useState<string[]>(state.courts.map(c => c.id))
  const [hoveredCourt, setHoveredCourt] = useState<string | null>(null)
  const [timeInterval, setTimeInterval] = useState<15 | 30>(30)
  const [showDrawColors, setShowDrawColors] = useState<boolean>(false)
  
  // Update court order when courts change
  useEffect(() => {
    setCourtOrder(state.courts.map(c => c.id))
  }, [state.courts])

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const refreshData = () => {
      setLastRefreshTime(new Date())
      // Force a re-check of conflicts to simulate data refresh
      checkConflicts()
    }

    // Set up the interval for 5 minutes (300000 ms)
    const intervalId = setInterval(refreshData, 300000)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId)
  }, [checkConflicts, setLastRefreshTime])
  
  // Get ordered courts
  const orderedCourts = courtOrder
    .map(id => state.courts.find(c => c.id === id))
    .filter((court): court is NonNullable<typeof court> => Boolean(court))

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

  // Get timeframe from wizard data
  const timeframe = getTournamentTimeframe()

  // Generate time slots based on wizard timeframe with configurable intervals
  const generateTimeSlots = (): string[] => {
    const slots = []
    const intervalsPerHour = 60 / timeInterval
    
    for (let hour = timeframe.startHour; hour < timeframe.endHour; hour++) {
      for (let i = 0; i < intervalsPerHour; i++) {
        const minutes = i * timeInterval
        slots.push(`${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`)
      }
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
    return Math.ceil(match.estimatedDuration / timeInterval)
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

  // Check if a match would overlap with any existing matches when placed at a position
  const wouldMatchOverlap = (match: Match, courtId: string, startTime: string, excludeMatchId?: string): boolean => {
    if (!match.estimatedDuration) return false
    
    const [startHour, startMin] = startTime.split(':').map(Number)
    const startMinutes = startHour * 60 + startMin
    const endMinutes = startMinutes + match.estimatedDuration
    
    return dayMatches.some(existingMatch => {
      if (existingMatch.id === match.id || existingMatch.id === excludeMatchId) return false
      if (existingMatch.courtId !== courtId) return false
      if (!existingMatch.scheduledTime || !existingMatch.estimatedDuration) return false
      
      const [existingStartHour, existingStartMin] = existingMatch.scheduledTime.split(':').map(Number)
      const existingStartMinutes = existingStartHour * 60 + existingStartMin
      const existingEndMinutes = existingStartMinutes + existingMatch.estimatedDuration
      
      // Check for overlap
      return (startMinutes < existingEndMinutes && endMinutes > existingStartMinutes)
    })
  }

  // Check if a swap between two matches would be valid for both positions
  const isValidSwap = (match1: Match, match2: Match): boolean => {
    if (!match1.courtId || !match1.scheduledTime || !match2.courtId || !match2.scheduledTime) return false
    
    // Cannot swap if either match is completed or in-progress
    if (match1.status === 'completed' || match1.status === 'in-progress' || 
        match2.status === 'completed' || match2.status === 'in-progress') {
      return false
    }
    
    // Check if match1 can go to match2's position
    const match1Valid = !wouldMatchOverlap(match1, match2.courtId, match2.scheduledTime, match2.id) &&
                       isCourtTimeSlotAvailable(match2.courtId, match2.scheduledTime) &&
                       !getBlockerForSlot(match2.courtId, match2.scheduledTime) &&
                       !checkPlayerConflict(match1, match2.scheduledTime)
    
    // Check if match2 can go to match1's position  
    const match2Valid = !wouldMatchOverlap(match2, match1.courtId, match1.scheduledTime, match1.id) &&
                       isCourtTimeSlotAvailable(match1.courtId, match1.scheduledTime) &&
                       !getBlockerForSlot(match1.courtId, match1.scheduledTime) &&
                       !checkPlayerConflict(match2, match1.scheduledTime)
    
    return match1Valid && match2Valid
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
    
    // Check if slot already has a match - if so, it's a potential swap
    const existingMatch = getMatchForSlot(courtId, timeSlot)
    if (existingMatch && existingMatch.id !== draggedMatch.id) {
      // This is a swap scenario - validate both positions
      return isValidSwap(draggedMatch, existingMatch)
    }
    
    // Check for duration-based overlaps
    if (wouldMatchOverlap(draggedMatch, courtId, timeSlot)) return false
    
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
    
    if (!draggedMatch) return
    
    const existingMatch = getMatchForSlot(courtId, timeSlot)
    const isValidDropZone = isValidDrop(courtId, timeSlot)
    
    if (existingMatch && existingMatch.id !== draggedMatch.id) {
      // Dragging over another match - check if swap is valid
      if (isValidSwap(draggedMatch, existingMatch)) {
        e.dataTransfer.dropEffect = 'move'
        setDragMode('swap')
        setDragOverMatch(existingMatch)
        setDragOverCell({ courtId, timeSlot })
      } else {
        e.dataTransfer.dropEffect = 'none'
        setDragMode('invalid')
        setDragOverMatch(existingMatch)
        setDragOverCell({ courtId, timeSlot })
      }
    } else if (isValidDropZone) {
      // Dragging over empty valid slot
      e.dataTransfer.dropEffect = 'move'
      setDragMode('move')
      setDragOverMatch(null)
      setDragOverCell({ courtId, timeSlot })
    } else {
      // Dragging over invalid location
      e.dataTransfer.dropEffect = 'none'
      setDragMode('invalid')
      setDragOverMatch(null)
      setDragOverCell({ courtId, timeSlot })
    }
  }

  const handleDragLeave = () => {
    setDragOverCell(null)
    setDragOverMatch(null)
    setDragMode('move')
  }

  const handleDrop = (e: React.DragEvent, courtId: string, timeSlot: string) => {
    e.preventDefault()
    
    if (!draggedMatch || !isValidDrop(courtId, timeSlot)) {
      // Reset drag state
      setDragOverCell(null)
      setDragOverMatch(null)
      setDragMode('move')
      setDraggedMatch(null)
      return
    }
    
    const existingMatch = getMatchForSlot(courtId, timeSlot)
    
    if (existingMatch && existingMatch.id !== draggedMatch.id && dragMode === 'swap') {
      // Perform match swap
      const draggedOriginalCourt = draggedMatch.courtId
      const draggedOriginalTime = draggedMatch.scheduledTime
      
      if (draggedOriginalCourt && draggedOriginalTime) {
        // Animate both cells
        const cellKey1 = `${courtId}-${timeSlot}`
        const cellKey2 = `${draggedOriginalCourt}-${draggedOriginalTime}`
        setAnimatingCells(prev => new Set(prev).add(cellKey1).add(cellKey2))
        
        // Swap the matches
        moveMatch(draggedMatch.id, courtId, timeSlot)
        moveMatch(existingMatch.id, draggedOriginalCourt, draggedOriginalTime)
        
        checkConflicts()
        
        // Remove animations after delay
        setTimeout(() => {
          setAnimatingCells(prev => {
            const newSet = new Set(prev)
            newSet.delete(cellKey1)
            newSet.delete(cellKey2)
            return newSet
          })
        }, 500)
      }
    } else {
      // Regular move to empty slot
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
    
    // Reset drag state
    setDragOverCell(null)
    setDragOverMatch(null)
    setDragMode('move')
    setDraggedMatch(null)
  }

  const handleDragEnd = () => {
    setDraggedMatch(null)
    setDragOverCell(null)
    setDragOverMatch(null)
    setDragMode('move')
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
    } else if (isDragOver) {
      if (dragMode === 'swap') {
        classes += ' bg-purple-100 border-2 border-purple-400 shadow-lg'
      } else if (dragMode === 'move' && isValidDropZone) {
        classes += ' bg-green-100 border-2 border-green-400 shadow-lg'
      } else if (dragMode === 'invalid') {
        classes += ' bg-red-100 border-2 border-red-400'
      }
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

  // Get status color with draw-specific colors or uniform colors based on status
  const getStatusColor = (match: Match): string => {
    if (showDrawColors && match.drawId) {
      // Use centralized draw color mapping with subtle colors
      const baseColor = getDrawColor(match.drawId)
      
      // Add status-specific modifications for better visibility
      switch (match.status) {
        case 'scheduled':
          return `${baseColor} shadow-sm hover:shadow-md transition-all border-2`
        case 'in-progress':
          return `${baseColor} shadow-lg animate-pulse ring-2 ring-offset-1 ring-green-400 border-2`
        case 'completed':
          return `${baseColor} opacity-50 border`
        case 'postponed':
          return `${baseColor} opacity-75 border-dashed border-2`
        default:
          return `${baseColor} shadow-sm border`
      }
    }
    
    // Default uniform colors (status-based) - also using softer colors
    switch (match.status) {
      case 'scheduled': return 'bg-blue-100 border-2 border-blue-300 text-blue-900 shadow-sm hover:shadow-md'
      case 'in-progress': return 'bg-green-100 border-2 border-green-400 text-green-900 shadow-md animate-pulse'
      case 'completed': return 'bg-gray-100 border border-gray-300 text-gray-700 opacity-75'
      case 'postponed': return 'bg-yellow-100 border-2 border-yellow-300 text-yellow-900 shadow-sm'
      default: return 'bg-blue-100 border-2 border-blue-300 text-blue-900 shadow-sm'
    }
  }

  // Check if match conflicts with blocker
  const checkMatchBlockerConflict = (match: Match): boolean => {
    if (!match.scheduledTime || !match.scheduledDate || !match.courtId) return false
    
    // Check if match overlaps with any blocker
    return dayBlockers.some(blocker => {
      if (blocker.courtId !== match.courtId || blocker.date !== match.scheduledDate) return false
      
      // Check time overlap
      const matchStart = match.scheduledTime
      if (!matchStart) return false
      const [matchHour, matchMin] = matchStart.split(':').map(Number)
      const matchEndMinutes = matchHour * 60 + matchMin + (match.estimatedDuration || 90)
      const matchEndTime = `${Math.floor(matchEndMinutes / 60).toString().padStart(2, '0')}:${(matchEndMinutes % 60).toString().padStart(2, '0')}`
      
      return (
        (matchStart >= blocker.startTime && matchStart < blocker.endTime) ||
        (matchEndTime > blocker.startTime && matchEndTime <= blocker.endTime) ||
        (matchStart <= blocker.startTime && matchEndTime >= blocker.endTime)
      )
    })
  }

  // Get available dates (only days with scheduled matches)
  const getAvailableDates = () => {
    const allDates = state.matches
      .map(match => match.scheduledDate)
      .filter((date): date is string => Boolean(date)) // Filter out null/undefined dates with type guard
      .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
      .sort() // Sort chronologically
    
    return allDates.map(date => ({
      value: date,
      label: new Date(date).toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }))
  }

  const availableDates = getAvailableDates()

  return (
    <div className="grid-view-container overflow-auto h-full">
      {/* Date and Time Interval Selector */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20">
        <div className="flex items-center space-x-6">
          {/* Date Selector */}
          <div className="flex items-center space-x-2">
            <label htmlFor="grid-date-select" className="text-sm font-medium text-gray-700">
              Date:
            </label>
            <select
              id="grid-date-select"
              value={state.selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableDates.map(date => (
                <option key={date.value} value={date.value}>
                  {date.label}
                </option>
              ))}
            </select>
          </div>

          {/* Time Interval Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Time Interval:</span>
            <div className="flex space-x-2">
              <button
                onClick={() => setTimeInterval(15)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeInterval === 15
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                15 min
              </button>
              <button
                onClick={() => setTimeInterval(30)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeInterval === 30
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                30 min
              </button>
            </div>
          </div>

          {/* Draw Colors Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Colors:</span>
            <button
              onClick={() => setShowDrawColors(!showDrawColors)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                showDrawColors
                  ? 'bg-green-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showDrawColors ? 'By Draw' : 'Uniform'}
            </button>
          </div>
          
          <div className="ml-auto text-sm text-gray-500">
            Showing {timeSlots.length} time slots
          </div>
        </div>
      </div>
      
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
                          className={`match-card rounded-lg border-2 p-2 transition-all duration-200 transform ${getStatusColor(match)} ${
                            match.status === 'completed' || match.status === 'in-progress' ? 'cursor-not-allowed' : 'cursor-move'
                          } ${
                            hoveredMatch === match.id && match.status !== 'completed' && match.status !== 'in-progress' ? 'scale-105 z-10' : ''
                          } ${draggedMatch?.id === match.id ? 'opacity-50' : ''} ${
                            dragOverMatch?.id === match.id && dragMode === 'swap' ? 'ring-2 ring-purple-400 ring-offset-1 shadow-lg scale-105' : ''
                          } ${
                            dragOverMatch?.id === match.id && dragMode === 'invalid' ? 'ring-2 ring-red-400 ring-offset-1 shadow-lg' : ''
                          }`}
                          draggable={match.status !== 'completed' && match.status !== 'in-progress'}
                          onDragStart={(e) => {
                            if (match.status === 'completed' || match.status === 'in-progress') {
                              e.preventDefault()
                              return
                            }
                            handleDragStart(e, match)
                          }}
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
                            {checkMatchBlockerConflict(match) && (
                              <ExclamationTriangleIcon 
                                className="w-4 h-4 text-red-600 animate-pulse" 
                                title="Warning: Match conflicts with a court blocker"
                              />
                            )}
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
                          {match.roundName && (
                            <div className="mt-1 pt-1 border-t border-gray-300">
                              <span className="text-xs text-gray-600 font-medium">
                                {match.roundName}
                              </span>
                            </div>
                          )}
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
    </div>
  )
}

export default GridView