import React, { useState, useMemo } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Match, MatchStatus } from '../../types/tournament'
import { ChevronUpIcon, ChevronDownIcon, MagnifyingGlassIcon, FunnelIcon, ArrowPathIcon, CheckCircleIcon, ClockIcon, PlayIcon, PauseIcon, ExclamationTriangleIcon, MapPinIcon } from '@heroicons/react/24/outline'

type SortField = 'time' | 'court' | 'draw' | 'players' | 'status' | 'priority'
type SortDirection = 'asc' | 'desc'

const ListView: React.FC = () => {
  const { state, updateMatch, updateMatchStatus, setSelectedMatch } = useTournament()
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())
  const [sortField, setSortField] = useState<SortField>('time')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [filterStatus, setFilterStatus] = useState<MatchStatus | 'all'>('all')
  const [filterDraw, setFilterDraw] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Filter and sort matches
  const filteredAndSortedMatches = useMemo(() => {
    let filtered = state.matches.filter(match => match.scheduledDate === state.selectedDate)

    // Apply filters
    if (filterStatus !== 'all') {
      filtered = filtered.filter(match => match.status === filterStatus)
    }
    
    if (filterDraw !== 'all') {
      filtered = filtered.filter(match => match.drawId === filterDraw)
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

    // Sort matches
    filtered.sort((a, b) => {
      let aValue: any = ''
      let bValue: any = ''

      switch (sortField) {
        case 'time':
          aValue = `${a.scheduledDate || ''} ${a.scheduledTime || ''}`
          bValue = `${b.scheduledDate || ''} ${b.scheduledTime || ''}`
          break
        case 'court':
          aValue = a.courtName || ''
          bValue = b.courtName || ''
          break
        case 'draw':
          aValue = a.drawName
          bValue = b.drawName
          break
        case 'players':
          aValue = `${a.player1Name || ''} ${a.player2Name || ''}`
          bValue = `${b.player1Name || ''} ${b.player2Name || ''}`
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          aValue = priorityOrder[a.priority as keyof typeof priorityOrder] || 0
          bValue = priorityOrder[b.priority as keyof typeof priorityOrder] || 0
          break
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return filtered
  }, [state.matches, state.selectedDate, filterStatus, filterDraw, searchTerm, sortField, sortDirection])

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Handle row selection
  const handleRowSelect = (matchId: string, selected: boolean) => {
    const newSelection = new Set(selectedMatches)
    if (selected) {
      newSelection.add(matchId)
    } else {
      newSelection.delete(matchId)
    }
    setSelectedMatches(newSelection)
  }

  // Handle select all
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedMatches(new Set(filteredAndSortedMatches.map(match => match.id)))
    } else {
      setSelectedMatches(new Set())
    }
  }

  // Bulk operations
  const handleBulkStatusChange = (status: MatchStatus) => {
    selectedMatches.forEach(matchId => {
      updateMatchStatus(matchId, status)
    })
    setSelectedMatches(new Set())
  }

  const handleBulkCourtAssignment = (courtId: string) => {
    const court = state.courts.find(c => c.id === courtId)
    selectedMatches.forEach(matchId => {
      updateMatch(matchId, { courtId, courtName: court?.name })
    })
    setSelectedMatches(new Set())
  }

  // Get status badge classes
  const getStatusBadge = (status: MatchStatus): string => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
    switch (status) {
      case 'scheduled': return `${baseClasses} bg-blue-100 text-blue-800`
      case 'in-progress': return `${baseClasses} bg-green-100 text-green-800`
      case 'completed': return `${baseClasses} bg-gray-100 text-gray-800`
      case 'postponed': return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'walkover': return `${baseClasses} bg-red-100 text-red-800`
      default: return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  // Get priority badge classes
  const getPriorityBadge = (priority?: string): string => {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium'
    switch (priority) {
      case 'high': return `${baseClasses} bg-red-100 text-red-700`
      case 'medium': return `${baseClasses} bg-yellow-100 text-yellow-700`
      case 'low': return `${baseClasses} bg-green-100 text-green-700`
      default: return `${baseClasses} bg-gray-100 text-gray-700`
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

  // Render sort icon
  const SortIcon: React.FC<{ field: SortField }> = ({ field }) => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? 
      <ChevronUpIcon className="w-4 h-4 inline" /> : 
      <ChevronDownIcon className="w-4 h-4 inline" />
  }

  return (
    <div className="list-view-container h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Enhanced Filters and Search */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        {/* Header Stats */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">Total: {filteredAndSortedMatches.length} matches</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircleIcon className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">{filteredAndSortedMatches.filter(m => m.status === 'completed').length} completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <PlayIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">{filteredAndSortedMatches.filter(m => m.status === 'in-progress').length} in progress</span>
              </div>
            </div>
            <div className="text-sm text-gray-500">
              Showing results for {new Date(state.selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
        
        {/* Enhanced Search and Filters */}
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
                  <option value="postponed">Postponed</option>
                  <option value="walkover">Walkover</option>
                </select>
              </div>

              <select
                value={filterDraw}
                onChange={(e) => setFilterDraw(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm font-medium"
              >
                <option value="all">All Draws</option>
                {state.draws.map(draw => (
                  <option key={draw.id} value={draw.id}>{draw.name}</option>
                ))}
              </select>
              
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('all')
                  setFilterDraw('all')
                  setSelectedMatches(new Set())
                }}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center space-x-2"
                title="Clear all filters"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>
          </div>

          {/* Enhanced Bulk Operations */}
          {selectedMatches.size > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {selectedMatches.size}
                  </div>
                  <span className="text-sm font-bold text-blue-900">
                    {selectedMatches.size === 1 ? 'match' : 'matches'} selected
                  </span>
                </div>
                
                <div className="h-6 w-px bg-blue-300"></div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleBulkStatusChange('scheduled')}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 text-sm font-medium flex items-center space-x-1 hover:scale-105 shadow-sm"
                  >
                    <ClockIcon className="w-4 h-4" />
                    <span>Schedule</span>
                  </button>
                  
                  <button
                    onClick={() => handleBulkStatusChange('in-progress')}
                    className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 text-sm font-medium flex items-center space-x-1 hover:scale-105 shadow-sm"
                  >
                    <PlayIcon className="w-4 h-4" />
                    <span>Start</span>
                  </button>
                  
                  <button
                    onClick={() => handleBulkStatusChange('postponed')}
                    className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-all duration-200 text-sm font-medium flex items-center space-x-1 hover:scale-105 shadow-sm"
                  >
                    <PauseIcon className="w-4 h-4" />
                    <span>Postpone</span>
                  </button>
                  
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleBulkCourtAssignment(e.target.value)
                        e.target.value = ''
                      }
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium bg-white shadow-sm hover:border-gray-400 transition-colors"
                    defaultValue=""
                  >
                    <option value="">Assign Court...</option>
                    {state.courts.map(court => (
                      <option key={court.id} value={court.id}>{court.name} ({court.surface})</option>
                    ))}
                  </select>
                  
                  <button
                    onClick={() => setSelectedMatches(new Set())}
                    className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200 text-sm font-medium hover:scale-105 shadow-sm"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Table */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <table className="min-w-full divide-y divide-gray-200 bg-white shadow-sm">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="px-6 py-4 text-left">
                <input
                  type="checkbox"
                  checked={selectedMatches.size === filteredAndSortedMatches.length && filteredAndSortedMatches.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </th>
              
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors border-r border-gray-200 flex items-center space-x-1"
                onClick={() => handleSort('time')}
              >
                <ClockIcon className="w-4 h-4" />
                <span>Time</span>
                <SortIcon field="time" />
              </th>
              
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors border-r border-gray-200"
                onClick={() => handleSort('court')}
              >
                <div className="flex items-center space-x-1">
                  <MapPinIcon className="w-4 h-4" />
                  <span>Court</span>
                  <SortIcon field="court" />
                </div>
              </th>
              
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors border-r border-gray-200"
                onClick={() => handleSort('draw')}
              >
                <div className="flex items-center space-x-1">
                  <span>🏆</span>
                  <span>Draw</span>
                  <SortIcon field="draw" />
                </div>
              </th>
              
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors border-r border-gray-200"
                onClick={() => handleSort('players')}
              >
                <div className="flex items-center space-x-1">
                  <span>👥</span>
                  <span>Players</span>
                  <SortIcon field="players" />
                </div>
              </th>
              
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors border-r border-gray-200"
                onClick={() => handleSort('status')}
              >
                <div className="flex items-center space-x-1">
                  <span>Status</span>
                  <SortIcon field="status" />
                </div>
              </th>
              
              <th 
                className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors border-r border-gray-200"
                onClick={() => handleSort('priority')}
              >
                <div className="flex items-center space-x-1">
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>Priority</span>
                  <SortIcon field="priority" />
                </div>
              </th>
              
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredAndSortedMatches.map((match, index) => (
              <tr 
                key={match.id} 
                className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-200 cursor-pointer group ${
                  selectedMatches.has(match.id) 
                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 shadow-sm' 
                    : index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                }`}
                onClick={() => setSelectedMatch(match)}
              >
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedMatches.has(match.id)}
                    onChange={(e) => handleRowSelect(match.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-bold text-gray-900">
                      {match.scheduledTime || 'TBD'}
                    </span>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-4 h-4 text-green-500" />
                    <div>
                      <div className="text-sm font-bold text-gray-900">{match.courtName || 'TBD'}</div>
                      {match.courtName && (
                        <div className="text-xs text-gray-500">
                          {state.courts.find(c => c.id === match.courtId)?.surface} • 
                          {state.courts.find(c => c.id === match.courtId)?.indoor ? '🏠 Indoor' : '🌤️ Outdoor'}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                      🏆
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900">{match.drawName}</div>
                      <div className="text-xs text-gray-600 font-medium">{match.roundName}</div>
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4">
                  <div className="max-w-52">
                    <div className="text-sm font-bold text-gray-900">{formatPlayers(match)}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      {match.isDoubles && (
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">Doubles</span>
                      )}
                      {match.estimatedDuration && (
                        <span className="text-xs text-gray-500">⏱️ {match.estimatedDuration}min</span>
                      )}
                    </div>
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <span className={`${getStatusBadge(match.status)} flex items-center space-x-1`}>
                      {match.status === 'in-progress' && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>}
                      {match.status === 'completed' && <CheckCircleIcon className="w-3 h-3" />}
                      {match.status === 'scheduled' && <ClockIcon className="w-3 h-3" />}
                      {match.status === 'postponed' && <PauseIcon className="w-3 h-3" />}
                      <span className="capitalize font-bold">{match.status.replace('-', ' ')}</span>
                    </span>
                    {match.score && (
                      <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded border">{match.score}</div>
                    )}
                  </div>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`${getPriorityBadge(match.priority)} flex items-center space-x-1`}>
                    {match.priority === 'high' && <ExclamationTriangleIcon className="w-3 h-3" />}
                    <span className="capitalize font-bold">{match.priority || 'normal'}</span>
                  </span>
                </td>
                
                <td className="px-6 py-4 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={match.status}
                    onChange={(e) => updateMatchStatus(match.id, e.target.value as MatchStatus)}
                    className="text-xs border-2 border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white font-medium hover:border-gray-400 transition-colors"
                  >
                    <option value="scheduled">📅 Scheduled</option>
                    <option value="in-progress">▶️ In Progress</option>
                    <option value="completed">✅ Completed</option>
                    <option value="postponed">⏸️ Postponed</option>
                    <option value="walkover">🚫 Walkover</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Enhanced Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200 shadow-inner">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="font-medium text-gray-700">
                Showing <span className="font-bold text-blue-600">{filteredAndSortedMatches.length}</span> of <span className="font-bold">{state.matches.filter(m => m.scheduledDate === state.selectedDate).length}</span> matches
              </span>
            </div>
            {selectedMatches.size > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="font-medium text-purple-700">
                  <span className="font-bold">{selectedMatches.size}</span> selected
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>Updated: {new Date().toLocaleTimeString()}</span>
            <span>•</span>
            <span>View: List</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ListView