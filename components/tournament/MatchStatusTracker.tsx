import React, { useState, useMemo } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Match, MatchStatus } from '../../types/tournament'
import { ClockIcon, TrophyIcon, CheckCircleIcon, PlayIcon, PauseIcon, ExclamationTriangleIcon, ChartBarIcon, CalendarDaysIcon, MapPinIcon, UserIcon, StopIcon } from '@heroicons/react/24/outline'

const MatchStatusTracker: React.FC = () => {
  const { state, updateMatchStatus, updateMatch } = useTournament()
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | 'all'>('all')
  const [selectedDate, setSelectedDate] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'time' | 'status' | 'court'>('time')
  const [showStatusHistory, setShowStatusHistory] = useState(false)

  // Get available dates
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(state.matches.map(m => m.scheduledDate).filter(Boolean)))
    return dates.sort()
  }, [state.matches])

  // Filter and sort matches
  const filteredMatches = useMemo(() => {
    let filtered = state.matches

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(match => match.status === selectedStatus)
    }

    if (selectedDate !== 'all') {
      filtered = filtered.filter(match => match.scheduledDate === selectedDate)
    }

    // Sort matches
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'time':
          const timeA = `${a.scheduledDate || ''} ${a.scheduledTime || ''}`
          const timeB = `${b.scheduledDate || ''} ${b.scheduledTime || ''}`
          return timeA.localeCompare(timeB)
        case 'status':
          return a.status.localeCompare(b.status)
        case 'court':
          return (a.courtName || '').localeCompare(b.courtName || '')
        default:
          return 0
      }
    })
  }, [state.matches, selectedStatus, selectedDate, sortBy])

  // Get status statistics
  const statusStats = useMemo(() => {
    const stats = {
      total: state.matches.length,
      scheduled: 0,
      'in-progress': 0,
      completed: 0,
      postponed: 0,
      walkover: 0,
      unscheduled: 0
    }

    state.matches.forEach(match => {
      stats[match.status]++
    })

    return stats
  }, [state.matches])

  // Get status icon
  const getStatusIcon = (status: MatchStatus) => {
    switch (status) {
      case 'scheduled': return ClockIcon
      case 'in-progress': return PlayIcon
      case 'completed': return CheckCircleIcon
      case 'postponed': return PauseIcon
      case 'walkover': return StopIcon
      default: return ExclamationTriangleIcon
    }
  }

  // Get status color
  const getStatusColor = (status: MatchStatus): string => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in-progress': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'postponed': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'walkover': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }


  // Handle status change
  const handleStatusChange = (matchId: string, newStatus: MatchStatus) => {
    updateMatchStatus(matchId, newStatus)
    
    // If marking as completed, prompt for score
    if (newStatus === 'completed') {
      const score = prompt('Enter match score (e.g., 6-4, 6-2):')
      if (score) {
        updateMatch(matchId, { score })
      }
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
    <div className="match-status-tracker h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Match Status Tracker</h2>
                <p className="text-purple-100">Monitor and manage match progression</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{statusStats.total}</div>
              <div className="text-sm text-purple-100">Total Matches</div>
            </div>
          </div>
        </div>
        
        {/* Status Overview */}
        <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(statusStats).slice(1).map(([status, count]) => {
              const Icon = getStatusIcon(status as MatchStatus)
              return (
                <div key={status} className={`bg-white rounded-xl p-4 text-center shadow-sm border-2 transition-all hover:shadow-md ${getStatusColor(status as MatchStatus)}`}>
                  <div className="flex items-center justify-center mb-2">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs font-medium capitalize">{status.replace('-', ' ')}</div>
                </div>
              )
            })}
          </div>
        </div>
        
        {/* Filters */}
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as MatchStatus | 'all')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              >
                <option value="all">All Statuses</option>
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="postponed">Postponed</option>
                <option value="walkover">Walkover</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Date:</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              >
                <option value="all">All Dates</option>
                {availableDates.map(date => (
                  <option key={date} value={date}>
                    {date ? new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : date}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
              >
                <option value="time">Time</option>
                <option value="status">Status</option>
                <option value="court">Court</option>
              </select>
            </div>

            <div className="flex-1"></div>
            
            <button
              onClick={() => setShowStatusHistory(!showStatusHistory)}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium flex items-center space-x-2 shadow-sm hover:shadow-md"
            >
              <ChartBarIcon className="w-4 h-4" />
              <span>Status History</span>
            </button>
          </div>
        </div>
      </div>

      {/* Match List */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="space-y-4">
          {filteredMatches.map(match => (
            <div
              key={match.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
                      <TrophyIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{match.drawName}</h3>
                      <p className="text-sm text-gray-600 font-medium">{match.roundName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                    {match.scheduledDate && (
                      <div className="flex items-center">
                        <CalendarDaysIcon className="w-4 h-4 mr-1" />
                        {new Date(match.scheduledDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                      </div>
                    )}
                    {match.scheduledTime && (
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-1" />
                        {match.scheduledTime}
                      </div>
                    )}
                    {match.courtName && (
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-1" />
                        {match.courtName}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-3">
                    <UserIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900">{formatPlayers(match)}</span>
                    {match.gameType === 'Doubles' && (
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">Doubles</span>
                    )}
                  </div>
                  
                  {match.score && (
                    <div className="text-sm font-mono bg-gray-100 px-3 py-2 rounded-lg border mb-3">
                      <span className="font-bold text-gray-900">Score: {match.score}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex flex-col items-end space-y-3">
                  {/* Current Status */}
                  <div className={`px-4 py-2 rounded-xl border-2 font-bold text-sm flex items-center space-x-2 ${getStatusColor(match.status)}`}>
                    {React.createElement(getStatusIcon(match.status), { className: "w-4 h-4" })}
                    <span className="capitalize">{match.status.replace('-', ' ')}</span>
                  </div>
                  
                  {/* Priority */}
                  
                  {/* Status Change Actions */}
                  <div className="flex flex-wrap gap-2">
                    {match.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(match.id, 'in-progress')}
                          className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xs font-medium flex items-center space-x-1"
                        >
                          <PlayIcon className="w-3 h-3" />
                          <span>Start</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(match.id, 'postponed')}
                          className="px-3 py-1 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-xs font-medium flex items-center space-x-1"
                        >
                          <PauseIcon className="w-3 h-3" />
                          <span>Postpone</span>
                        </button>
                      </>
                    )}
                    
                    {match.status === 'in-progress' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(match.id, 'completed')}
                          className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium flex items-center space-x-1"
                        >
                          <CheckCircleIcon className="w-3 h-3" />
                          <span>Complete</span>
                        </button>
                        <button
                          onClick={() => handleStatusChange(match.id, 'walkover')}
                          className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs font-medium flex items-center space-x-1"
                        >
                          <StopIcon className="w-3 h-3" />
                          <span>Walkover</span>
                        </button>
                      </>
                    )}
                    
                    {match.status === 'postponed' && (
                      <button
                        onClick={() => handleStatusChange(match.id, 'scheduled')}
                        className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs font-medium flex items-center space-x-1"
                      >
                        <ClockIcon className="w-3 h-3" />
                        <span>Reschedule</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {match.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mt-4">
                  <div className="text-xs font-bold text-gray-700 mb-1">Notes:</div>
                  <div className="text-sm text-gray-800">{match.notes}</div>
                </div>
              )}
            </div>
          ))}
          
          {filteredMatches.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
              <p className="text-gray-600">Try adjusting your filters to see more matches.</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Summary */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 border-t border-gray-200 shadow-inner">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="w-4 h-4 text-purple-600" />
              <span className="font-medium text-gray-700">
                Showing: <span className="font-bold text-purple-600">{filteredMatches.length}</span> of <span className="font-bold">{statusStats.total}</span> matches
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium text-gray-700">
                <span className="font-bold text-green-600">{statusStats['in-progress']}</span> in progress
              </span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            Updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchStatusTracker