import { useState, useMemo, useRef, useEffect } from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  CalendarDaysIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UserIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { useTournament } from '@/contexts/TournamentContext'
import { Match, Court } from '@/types/tournament'
import MatchDetailsCard from './MatchDetailsCard'
import PlayerMatchCard from './PlayerMatchCard'

interface TimelineViewProps {
  selectedDate: string
  onDateChange?: (date: string) => void
}

type ZoomLevel = 'hour' | 'halfHour' | 'quarterHour'

export default function TimelineView({ selectedDate, onDateChange }: TimelineViewProps) {
  const { state } = useTournament()
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('halfHour')
  const [scrollPosition, setScrollPosition] = useState(0)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isMatchDetailsOpen, setIsMatchDetailsOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [isPlayerCardOpen, setIsPlayerCardOpen] = useState(false)
  const [hoveredMatch, setHoveredMatch] = useState<string | null>(null)
  const timelineRef = useRef<HTMLDivElement>(null)

  // Filter matches for the selected date
  const dateMatches = useMemo(() => {
    return state.matches.filter(match => 
      match.scheduledDate === selectedDate && match.scheduledTime
    )
  }, [state.matches, selectedDate])

  // Timeline configuration based on zoom level
  const timelineConfig = useMemo(() => {
    const configs = {
      hour: { 
        interval: 60, 
        startHour: 8, 
        endHour: 22, 
        cellWidth: 80,
        timeFormat: (hour: number) => `${hour}:00`
      },
      halfHour: { 
        interval: 30, 
        startHour: 8, 
        endHour: 22, 
        cellWidth: 60,
        timeFormat: (hour: number, minute: number) => `${hour}:${minute.toString().padStart(2, '0')}`
      },
      quarterHour: { 
        interval: 15, 
        startHour: 8, 
        endHour: 22, 
        cellWidth: 40,
        timeFormat: (hour: number, minute: number) => `${hour}:${minute.toString().padStart(2, '0')}`
      }
    }
    return configs[zoomLevel]
  }, [zoomLevel])

  // Generate time slots
  const timeSlots = useMemo(() => {
    const slots = []
    const { startHour, endHour, interval } = timelineConfig
    
    for (let hour = startHour; hour <= endHour; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        if (hour === endHour && minute > 0) break
        slots.push({
          hour,
          minute,
          timeString: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
          label: timelineConfig.timeFormat(hour, minute)
        })
      }
    }
    
    return slots
  }, [timelineConfig])

  // Convert time to position
  const getTimePosition = (timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes
    const startMinutes = timelineConfig.startHour * 60
    const position = ((totalMinutes - startMinutes) / timelineConfig.interval) * timelineConfig.cellWidth
    return Math.max(0, position)
  }

  // Get match width based on duration
  const getMatchWidth = (match: Match) => {
    const duration = match.duration || state.config.defaultMatchDuration
    const cells = duration / timelineConfig.interval
    return cells * timelineConfig.cellWidth - 4 // Subtract padding
  }

  // Group courts by type for better organization
  const groupedCourts = useMemo(() => {
    const indoor = state.courts.filter(court => court.indoor)
    const outdoor = state.courts.filter(court => !court.indoor)
    const finals = state.courts.filter(court => court.isFinalsCourt)
    const regular = state.courts.filter(court => !court.isFinalsCourt)
    
    return {
      finals: finals.sort((a, b) => a.name.localeCompare(b.name)),
      indoor: indoor.filter(c => !c.isFinalsCourt).sort((a, b) => a.name.localeCompare(b.name)),
      outdoor: outdoor.filter(c => !c.isFinalsCourt).sort((a, b) => a.name.localeCompare(b.name))
    }
  }, [state.courts])

  // Get matches for a specific court
  const getMatchesForCourt = (courtId: string) => {
    return dateMatches.filter(match => match.courtId === courtId)
      .sort((a, b) => (a.scheduledTime || '').localeCompare(b.scheduledTime || ''))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-600'
      case 'in-progress':
        return 'bg-yellow-500 border-yellow-600'
      case 'scheduled':
        return 'bg-blue-500 border-blue-600'
      case 'walkover':
        return 'bg-gray-500 border-gray-600'
      case 'postponed':
        return 'bg-red-500 border-red-600'
      default:
        return 'bg-gray-500 border-gray-600'
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
    const newDate = currentDate.toISOString().split('T')[0]
    onDateChange?.(newDate)
  }

  const handleZoom = (level: ZoomLevel) => {
    setZoomLevel(level)
    // Maintain relative scroll position when zooming
    if (timelineRef.current) {
      const currentScroll = timelineRef.current.scrollLeft
      const currentWidth = timeSlots.length * timelineConfig.cellWidth
      const newWidth = timeSlots.length * (level === 'hour' ? 80 : level === 'halfHour' ? 60 : 40)
      const newScroll = (currentScroll / currentWidth) * newWidth
      setTimeout(() => {
        if (timelineRef.current) {
          timelineRef.current.scrollLeft = newScroll
        }
      }, 0)
    }
  }

  const renderCourtRow = (court: Court, courtMatches: Match[]) => (
    <div key={court.id} className="border-b border-gray-100">
      {/* Court Header */}
      <div className="sticky left-0 z-20 bg-white border-r border-gray-200 px-4 py-3 min-w-[200px]">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-900">{court.name}</h4>
            <div className="flex items-center space-x-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center">
                <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                {court.surface} • {court.indoor ? 'Indoor' : 'Outdoor'}
              </span>
              {court.isFinalsCourt && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Finals Court
                </span>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {courtMatches.length} matches
          </div>
        </div>
      </div>

      {/* Timeline Track */}
      <div className="relative h-16 bg-gray-50" style={{ minWidth: timeSlots.length * timelineConfig.cellWidth }}>
        {/* Time grid lines */}
        {timeSlots.map((slot, index) => (
          <div
            key={`${slot.hour}-${slot.minute}`}
            className={`absolute top-0 bottom-0 ${
              slot.minute === 0 ? 'border-l-2 border-gray-300' : 'border-l border-gray-200'
            }`}
            style={{ left: index * timelineConfig.cellWidth }}
          />
        ))}

        {/* Matches */}
        {courtMatches.map((match) => {
          const position = getTimePosition(match.scheduledTime!)
          const width = getMatchWidth(match)
          const isHovered = hoveredMatch === match.id

          return (
            <div
              key={match.id}
              className={`absolute top-2 bottom-2 rounded border-2 cursor-pointer transition-all duration-200 ${
                getStatusColor(match.status)
              } ${
                isHovered ? 'z-30 transform scale-105 shadow-lg' : 'z-10'
              }`}
              style={{
                left: position,
                width: Math.max(width, 80), // Minimum width for readability
              }}
              onClick={() => handleMatchClick(match)}
              onMouseEnter={() => setHoveredMatch(match.id)}
              onMouseLeave={() => setHoveredMatch(null)}
            >
              <div className="p-2 h-full overflow-hidden">
                <div className="text-white text-xs font-medium truncate">
                  {match.player1Name} vs {match.player2Name}
                </div>
                <div className="text-white text-xs opacity-90 truncate">
                  {match.drawName} • {match.round}
                </div>
                <div className="text-white text-xs opacity-75 mt-1">
                  {match.scheduledTime}
                  {match.status === 'in-progress' && (
                    <span className="ml-1 animate-pulse">●</span>
                  )}
                </div>
              </div>
              
              {/* Tooltip on hover */}
              {isHovered && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-40">
                  <div className="font-medium">{match.player1Name} vs {match.player2Name}</div>
                  <div>{match.drawName} • {match.round}</div>
                  <div>{match.scheduledTime} • {match.duration || state.config.defaultMatchDuration} min</div>
                  {match.score && <div>Score: {match.score}</div>}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-2 border-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Tournament Timeline - {formatDateHeader(selectedDate)}
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

          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Zoom:</span>
                <div className="flex border border-gray-300 rounded-md overflow-hidden">
                  <button
                    onClick={() => handleZoom('hour')}
                    className={`px-3 py-1 text-xs ${
                      zoomLevel === 'hour' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    1h
                  </button>
                  <button
                    onClick={() => handleZoom('halfHour')}
                    className={`px-3 py-1 text-xs border-x border-gray-300 ${
                      zoomLevel === 'halfHour' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    30m
                  </button>
                  <button
                    onClick={() => handleZoom('quarterHour')}
                    className={`px-3 py-1 text-xs ${
                      zoomLevel === 'quarterHour' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    15m
                  </button>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className="w-4 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">Completed</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-3 bg-yellow-500 rounded"></div>
                <span className="text-gray-600">In Progress</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-600">Scheduled</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-4 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600">Postponed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Header */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex">
            {/* Court Column Header */}
            <div className="sticky left-0 z-40 bg-gray-100 border-r border-gray-200 px-4 py-3 min-w-[200px]">
              <span className="text-sm font-medium text-gray-700">Courts</span>
            </div>

            {/* Time Scale */}
            <div 
              ref={timelineRef}
              className="flex-1 overflow-x-auto"
              style={{ minWidth: timeSlots.length * timelineConfig.cellWidth }}
            >
              <div className="bg-gray-100 border-b border-gray-200 flex">
                {timeSlots.map((slot, index) => (
                  <div
                    key={`header-${slot.hour}-${slot.minute}`}
                    className={`flex-shrink-0 px-2 py-3 text-xs font-medium text-gray-600 text-center ${
                      slot.minute === 0 ? 'border-l-2 border-gray-400' : 'border-l border-gray-300'
                    }`}
                    style={{ width: timelineConfig.cellWidth }}
                  >
                    {zoomLevel === 'hour' || slot.minute === 0 ? slot.label : ''}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Timeline Body */}
        <div className="relative">
          {/* Finals Courts */}
          {groupedCourts.finals.length > 0 && (
            <>
              <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2">
                <span className="text-sm font-medium text-yellow-800">Finals Courts</span>
              </div>
              {groupedCourts.finals.map(court => 
                renderCourtRow(court, getMatchesForCourt(court.id))
              )}
            </>
          )}

          {/* Indoor Courts */}
          {groupedCourts.indoor.length > 0 && (
            <>
              <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
                <span className="text-sm font-medium text-blue-800">Indoor Courts</span>
              </div>
              {groupedCourts.indoor.map(court => 
                renderCourtRow(court, getMatchesForCourt(court.id))
              )}
            </>
          )}

          {/* Outdoor Courts */}
          {groupedCourts.outdoor.length > 0 && (
            <>
              <div className="bg-green-50 border-b border-green-200 px-4 py-2">
                <span className="text-sm font-medium text-green-800">Outdoor Courts</span>
              </div>
              {groupedCourts.outdoor.map(court => 
                renderCourtRow(court, getMatchesForCourt(court.id))
              )}
            </>
          )}
        </div>

        {/* Empty State */}
        {dateMatches.length === 0 && (
          <div className="text-center py-12">
            <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches scheduled</h3>
            <p className="text-gray-500">No matches are scheduled for this date.</p>
          </div>
        )}

        {/* Stats Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <span>🏟️ {state.courts.length} courts</span>
              <span>📊 {Math.round((dateMatches.filter(m => m.status === 'completed').length / Math.max(dateMatches.length, 1)) * 100)}% complete</span>
              <span>⏱️ {timelineConfig.startHour}:00 - {timelineConfig.endHour}:00</span>
            </div>
            <div className="flex items-center space-x-4">
              <span>Total: {dateMatches.length} matches</span>
              <span>•</span>
              <span>{dateMatches.filter(m => m.status === 'in-progress').length} live</span>
            </div>
          </div>
        </div>
      </div>

      {/* Match Details Modal */}
      <MatchDetailsCard
        isOpen={isMatchDetailsOpen}
        onClose={() => setIsMatchDetailsOpen(false)}
        match={selectedMatch}
      />

      {/* Player Card Modal */}
      <PlayerMatchCard
        isOpen={isPlayerCardOpen}
        onClose={() => setIsPlayerCardOpen(false)}
        playerName={selectedPlayer || ''}
      />
    </>
  )
}