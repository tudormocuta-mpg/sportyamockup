import React, { useState, useMemo } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Match, MatchStatus } from '../../types/tournament'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

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
    <div className="list-view-container h-full flex flex-col">
      {/* Filters and Search */}
      <div className="bg-white p-4 border-b border-gray-200 space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <input
            type="text"
            placeholder="Search matches..."
            className="flex-1 min-w-64 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as MatchStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="postponed">Postponed</option>
            <option value="walkover">Walkover</option>
          </select>

          <select
            value={filterDraw}
            onChange={(e) => setFilterDraw(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Draws</option>
            {state.draws.map(draw => (
              <option key={draw.id} value={draw.id}>{draw.name}</option>
            ))}
          </select>
        </div>

        {/* Bulk Operations */}
        {selectedMatches.size > 0 && (
          <div className="flex flex-wrap gap-2 items-center bg-blue-50 p-3 rounded-lg">
            <span className="text-sm font-medium text-blue-900">
              {selectedMatches.size} match{selectedMatches.size !== 1 ? 'es' : ''} selected:
            </span>
            
            <button
              onClick={() => handleBulkStatusChange('scheduled')}
              className="px-3 py-1 bg-blue-100 text-blue-800 rounded text-sm hover:bg-blue-200 transition-colors"
            >
              Mark Scheduled
            </button>
            
            <button
              onClick={() => handleBulkStatusChange('postponed')}
              className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded text-sm hover:bg-yellow-200 transition-colors"
            >
              Mark Postponed
            </button>
            
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleBulkCourtAssignment(e.target.value)
                  e.target.value = ''
                }
              }}
              className="px-2 py-1 border border-gray-300 rounded text-sm"
              defaultValue=""
            >
              <option value="">Assign Court...</option>
              {state.courts.map(court => (
                <option key={court.id} value={court.id}>{court.name}</option>
              ))}
            </select>
            
            <button
              onClick={() => setSelectedMatches(new Set())}
              className="px-3 py-1 bg-gray-100 text-gray-800 rounded text-sm hover:bg-gray-200 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedMatches.size === filteredAndSortedMatches.length && filteredAndSortedMatches.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('time')}
              >
                Time <SortIcon field="time" />
              </th>
              
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('court')}
              >
                Court <SortIcon field="court" />
              </th>
              
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('draw')}
              >
                Draw <SortIcon field="draw" />
              </th>
              
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('players')}
              >
                Players <SortIcon field="players" />
              </th>
              
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status <SortIcon field="status" />
              </th>
              
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('priority')}
              >
                Priority <SortIcon field="priority" />
              </th>
              
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedMatches.map((match) => (
              <tr 
                key={match.id} 
                className={`hover:bg-gray-50 ${selectedMatches.has(match.id) ? 'bg-blue-50' : ''}`}
                onClick={() => setSelectedMatch(match)}
              >
                <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selectedMatches.has(match.id)}
                    onChange={(e) => handleRowSelect(match.id, e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </td>
                
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {match.scheduledTime || 'TBD'}
                </td>
                
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  {match.courtName || 'TBD'}
                </td>
                
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div>
                    <div className="font-medium">{match.drawName}</div>
                    <div className="text-gray-500">{match.roundName}</div>
                  </div>
                </td>
                
                <td className="px-4 py-4 text-sm text-gray-900">
                  <div className="max-w-48">
                    {formatPlayers(match)}
                    {match.isDoubles && (
                      <span className="ml-2 text-xs text-gray-500">(Doubles)</span>
                    )}
                  </div>
                </td>
                
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={getStatusBadge(match.status)}>
                    {match.status}
                  </span>
                  {match.score && (
                    <div className="text-xs text-gray-500 mt-1">{match.score}</div>
                  )}
                </td>
                
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className={getPriorityBadge(match.priority)}>
                    {match.priority || 'normal'}
                  </span>
                </td>
                
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={match.status}
                    onChange={(e) => updateMatchStatus(match.id, e.target.value as MatchStatus)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="postponed">Postponed</option>
                    <option value="walkover">Walkover</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>
            Showing {filteredAndSortedMatches.length} of {state.matches.filter(m => m.scheduledDate === state.selectedDate).length} matches
          </span>
          <span>
            {selectedMatches.size > 0 && `${selectedMatches.size} selected`}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ListView