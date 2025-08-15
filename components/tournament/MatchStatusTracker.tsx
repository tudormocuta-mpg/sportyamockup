import React, { useState, useMemo } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Match, MatchStatus } from '../../types/tournament'
import { PlayIcon, PauseIcon, CheckCircleIcon, StopIcon } from '@heroicons/react/24/outline'

const MatchStatusTracker: React.FC = () => {
  const { state, updateMatchStatus, updateMatch } = useTournament()
  const [selectedStatus, setSelectedStatus] = useState<MatchStatus | 'all'>('all')
  const [selectedDate, setSelectedDate] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'time' | 'status' | 'court'>('time')

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

  // Get status color
  const getStatusColor = (status: MatchStatus): string => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700'
      case 'in-progress': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      case 'postponed': return 'bg-yellow-100 text-yellow-700'
      case 'walkover': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
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

  return (
    <div className="match-status-tracker h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Match Status</h2>
              <p className="text-sm text-gray-600 mt-1">Monitor and manage match progression</p>
            </div>
            <div className="flex items-center space-x-6">
              {Object.entries(statusStats).slice(1).map(([status, count]) => (
                <div key={status} className="text-center">
                  <div className="text-lg font-bold text-gray-900">{count}</div>
                  <div className="text-xs text-gray-500 capitalize">{status.replace('-', ' ')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as MatchStatus | 'all')}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="all">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="postponed">Postponed</option>
              <option value="walkover">Walkover</option>
            </select>
            
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="all">All Dates</option>
              {availableDates.map(date => (
                <option key={date} value={date}>
                  {date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : date}
                </option>
              ))}
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="time">Sort by Time</option>
              <option value="status">Sort by Status</option>
              <option value="court">Sort by Court</option>
            </select>
          </div>
        </div>
      </div>

      {/* Match Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Match</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Players</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date/Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredMatches.map(match => (
              <tr key={match.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{match.drawName}</div>
                  <div className="text-xs text-gray-500">{match.roundName}</div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {match.player1Name || 'TBD'} vs {match.player2Name || 'TBD'}
                  </div>
                  {match.gameType === 'Doubles' && (
                    <span className="text-xs text-purple-600">Doubles</span>
                  )}
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {match.scheduledDate ? new Date(match.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}
                  </div>
                  <div className="text-xs text-gray-500">{match.scheduledTime || '-'}</div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{match.courtName || '-'}</div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                    {match.status === 'in-progress' && (
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></div>
                    )}
                    {match.status.replace('-', ' ')}
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">{match.score || '-'}</div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    {match.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(match.id, 'in-progress')}
                          className="text-green-600 hover:text-green-900"
                          title="Start Match"
                        >
                          <PlayIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(match.id, 'postponed')}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Postpone"
                        >
                          <PauseIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    {match.status === 'in-progress' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(match.id, 'completed')}
                          className="text-blue-600 hover:text-blue-900"
                          title="Complete"
                        >
                          <CheckCircleIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(match.id, 'walkover')}
                          className="text-red-600 hover:text-red-900"
                          title="Walkover"
                        >
                          <StopIcon className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    {match.status === 'postponed' && (
                      <button
                        onClick={() => handleStatusChange(match.id, 'scheduled')}
                        className="text-blue-600 hover:text-blue-900"
                        title="Reschedule"
                      >
                        <PlayIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredMatches.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-sm">No matches found</div>
            <div className="text-xs mt-2">Adjust your filters to see more matches</div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6 text-gray-600">
            <span>Showing: <strong className="text-gray-900">{filteredMatches.length}</strong> of <strong>{statusStats.total}</strong> matches</span>
            <span>In Progress: <strong className="text-green-600">{statusStats['in-progress']}</strong></span>
            <span>Completed: <strong className="text-gray-900">{statusStats.completed}</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MatchStatusTracker