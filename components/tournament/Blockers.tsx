import React, { useState, useMemo } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Blocker } from '../../types/tournament'
import { TrashIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

const Blockers: React.FC = () => {
  const { state, removeBlocker } = useTournament()
  const [filterType, setFilterType] = useState<Blocker['type'] | 'all'>('all')
  const [filterDate, setFilterDate] = useState<string>('all')

  // Get available dates
  const availableDates = useMemo(() => {
    const dates = Array.from(new Set(state.blockers.map(b => b.date)))
    return dates.sort()
  }, [state.blockers])

  // Filter blockers
  const filteredBlockers = useMemo(() => {
    let filtered = state.blockers

    if (filterType !== 'all') {
      filtered = filtered.filter(blocker => blocker.type === filterType)
    }

    if (filterDate !== 'all') {
      filtered = filtered.filter(blocker => blocker.date === filterDate)
    }

    return filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.startTime.localeCompare(b.startTime)
    })
  }, [state.blockers, filterType, filterDate])

  // Get blocker statistics
  const blockerStats = useMemo(() => {
    const stats = {
      total: state.blockers.length,
      maintenance: 0,
      reserved: 0,
      unavailable: 0,
      other: 0
    }

    state.blockers.forEach(blocker => {
      stats[blocker.type]++
    })

    return stats
  }, [state.blockers])

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'maintenance': return 'bg-red-100 text-red-700'
      case 'reserved': return 'bg-purple-100 text-purple-700'
      case 'unavailable': return 'bg-gray-100 text-gray-700'
      default: return 'bg-orange-100 text-orange-700'
    }
  }

  const getDuration = (startTime: string, endTime: string): string => {
    const start = new Date(`2000-01-01 ${startTime}`)
    const end = new Date(`2000-01-01 ${endTime}`)
    const diffMs = end.getTime() - start.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 60) {
      return `${diffMins}min`
    } else {
      const hours = Math.floor(diffMins / 60)
      const mins = diffMins % 60
      return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`
    }
  }

  // Check for conflicts with matches
  const getBlockerConflicts = (blocker: Blocker): number => {
    return state.matches.filter(match => 
      match.courtId === blocker.courtId &&
      match.scheduledDate === blocker.date &&
      match.scheduledTime &&
      match.scheduledTime >= blocker.startTime &&
      match.scheduledTime < blocker.endTime
    ).length
  }

  return (
    <div className="blockers-container h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Court Blockers</h2>
              <p className="text-sm text-gray-600 mt-1">Manage court availability and restrictions</p>
            </div>
          </div>
        </div>
        
        {/* Filters */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="all">All Types</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
              <option value="unavailable">Unavailable</option>
              <option value="other">Other</option>
            </select>

            <select
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="all">All Dates</option>
              {availableDates.map(date => (
                <option key={date} value={date}>
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </option>
              ))}
            </select>
            
            <div className="flex-1"></div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>Total: <strong className="text-gray-900">{blockerStats.total}</strong></span>
              <span>Maintenance: <strong className="text-red-600">{blockerStats.maintenance}</strong></span>
              <span>Reserved: <strong className="text-purple-600">{blockerStats.reserved}</strong></span>
              <span>Unavailable: <strong className="text-gray-600">{blockerStats.unavailable}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Blockers Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Court</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conflicts</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredBlockers.map(blocker => {
              const conflicts = getBlockerConflicts(blocker)
              return (
                <tr key={blocker.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{blocker.title}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{blocker.courtName}</div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(blocker.type)}`}>
                      {blocker.type}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(blocker.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {blocker.startTime} - {blocker.endTime}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">
                      {getDuration(blocker.startTime, blocker.endTime)}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    {conflicts > 0 ? (
                      <div className="flex items-center text-red-600">
                        <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                        <span className="text-sm font-medium">{conflicts}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 truncate max-w-xs">
                      {blocker.description || '-'}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to delete this blocker?')) {
                          removeBlocker(blocker.id)
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        {filteredBlockers.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-sm">No blockers found</div>
            <div className="text-xs mt-2">Adjust your filters to see blockers</div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6 text-gray-600">
            <span>Showing: <strong className="text-gray-900">{filteredBlockers.length}</strong> of <strong>{blockerStats.total}</strong> blockers</span>
            <span>Total Conflicts: <strong className="text-red-600">
              {filteredBlockers.reduce((sum, b) => sum + getBlockerConflicts(b), 0)}
            </strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blockers