import { useState, useMemo, useCallback } from 'react'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EllipsisVerticalIcon,
  TrashIcon,
  PencilIcon,
  DocumentDuplicateIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { useTournament } from '@/contexts/TournamentContext'
import { Match, MatchStatus } from '@/types/tournament'
import MatchDetailsCard from './MatchDetailsCard'
import PlayerMatchCard from './PlayerMatchCard'

interface ListViewProps {
  selectedDate: string
  onDateChange?: (date: string) => void
}

type SortField = 'time' | 'court' | 'draw' | 'round' | 'player1' | 'player2' | 'status'
type SortDirection = 'asc' | 'desc'

export default function ListView({ selectedDate, onDateChange }: ListViewProps) {
  const { state, rescheduleMatch, updateMatchStatus } = useTournament()
  const [sortField, setSortField] = useState<SortField>('time')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<MatchStatus | 'all'>('all')
  const [drawFilter, setDrawFilter] = useState<string>('all')
  const [selectedMatches, setSelectedMatches] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(20)
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [isMatchDetailsOpen, setIsMatchDetailsOpen] = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [isPlayerCardOpen, setIsPlayerCardOpen] = useState(false)
  const [showBulkActions, setShowBulkActions] = useState(false)

  // Filter matches for the selected date
  const dateMatches = useMemo(() => {
    return state.matches.filter(match => 
      match.scheduledDate === selectedDate
    )
  }, [state.matches, selectedDate])

  // Get unique draws for filter dropdown
  const uniqueDraws = useMemo(() => {
    const draws = Array.from(new Set(dateMatches.map(m => m.drawName).filter(Boolean)))
    return draws.sort()
  }, [dateMatches])

  // Apply filters and search
  const filteredMatches = useMemo(() => {
    let filtered = dateMatches

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(match => 
        match.player1Name?.toLowerCase().includes(term) ||
        match.player2Name?.toLowerCase().includes(term) ||
        match.drawName?.toLowerCase().includes(term) ||
        match.round?.toLowerCase().includes(term) ||
        match.courtName?.toLowerCase().includes(term)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(match => match.status === statusFilter)
    }

    // Apply draw filter
    if (drawFilter !== 'all') {
      filtered = filtered.filter(match => match.drawName === drawFilter)
    }

    return filtered
  }, [dateMatches, searchTerm, statusFilter, drawFilter])

  // Sort matches
  const sortedMatches = useMemo(() => {
    return [...filteredMatches].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case 'time':
          aValue = a.scheduledTime || '23:59'
          bValue = b.scheduledTime || '23:59'
          break
        case 'court':
          aValue = a.courtName || 'ZZZ'
          bValue = b.courtName || 'ZZZ'
          break
        case 'draw':
          aValue = a.drawName || 'ZZZ'
          bValue = b.drawName || 'ZZZ'
          break
        case 'round':
          aValue = a.round || 'ZZZ'
          bValue = b.round || 'ZZZ'
          break
        case 'player1':
          aValue = a.player1Name || 'ZZZ'
          bValue = b.player1Name || 'ZZZ'
          break
        case 'player2':
          aValue = a.player2Name || 'ZZZ'
          bValue = b.player2Name || 'ZZZ'
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredMatches, sortField, sortDirection])

  // Paginate matches
  const paginatedMatches = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return sortedMatches.slice(startIndex, startIndex + pageSize)
  }, [sortedMatches, currentPage, pageSize])

  const totalPages = Math.ceil(sortedMatches.length / pageSize)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
    setCurrentPage(1)
  }

  const handleSelectMatch = (matchId: string, selected: boolean) => {
    const newSelected = new Set(selectedMatches)
    if (selected) {
      newSelected.add(matchId)
    } else {
      newSelected.delete(matchId)
    }
    setSelectedMatches(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedMatches(new Set(paginatedMatches.map(m => m.id)))
    } else {
      setSelectedMatches(new Set())
    }
    setShowBulkActions(selected && paginatedMatches.length > 0)
  }

  const handleBulkStatusChange = (status: MatchStatus) => {
    selectedMatches.forEach(matchId => {
      updateMatchStatus(matchId, status)
    })
    setSelectedMatches(new Set())
    setShowBulkActions(false)
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

  const getStatusColor = (status: MatchStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800'
      case 'walkover':
        return 'bg-gray-100 text-gray-800'
      case 'postponed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
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

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center space-x-1 text-left hover:text-gray-900"
    >
      <span>{children}</span>
      {sortField === field && (
        sortDirection === 'asc' ? 
          <ChevronUpIcon className="h-4 w-4" /> : 
          <ChevronDownIcon className="h-4 w-4" />
      )}
    </button>
  )

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Match List - {formatDateHeader(selectedDate)}
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

          {/* Search and Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search matches, players, draws..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center px-3 py-2 border rounded-md ${
                showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-700'
              }`}
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Filter Controls */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Statuses</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="walkover">Walkover</option>
                    <option value="postponed">Postponed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Draw</label>
                  <select
                    value={drawFilter}
                    onChange={(e) => setDrawFilter(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Draws</option>
                    {uniqueDraws.map(draw => (
                      <option key={draw} value={draw}>{draw}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setStatusFilter('all')
                      setDrawFilter('all')
                    }}
                    className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bulk Actions Bar */}
        {showBulkActions && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedMatches.size} matches selected
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkStatusChange('scheduled')}
                  className="px-3 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Mark Scheduled
                </button>
                <button
                  onClick={() => handleBulkStatusChange('in-progress')}
                  className="px-3 py-1.5 text-xs font-medium bg-yellow-600 text-white rounded hover:bg-yellow-700"
                >
                  Mark In Progress
                </button>
                <button
                  onClick={() => handleBulkStatusChange('completed')}
                  className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Mark Completed
                </button>
                <button
                  onClick={() => {
                    setSelectedMatches(new Set())
                    setShowBulkActions(false)
                  }}
                  className="px-3 py-1.5 text-xs font-medium bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={paginatedMatches.length > 0 && selectedMatches.size === paginatedMatches.length}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="time">Time</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="court">Court</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="draw">Draw</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="round">Round</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="player1">Player 1</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="player2">Player 2</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <SortButton field="status">Status</SortButton>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedMatches.map((match, index) => (
                <tr 
                  key={match.id}
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50 cursor-pointer transition-colors`}
                  onClick={() => handleMatchClick(match)}
                >
                  <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={selectedMatches.has(match.id)}
                      onChange={(e) => handleSelectMatch(match.id, e.target.checked)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {match.scheduledTime || 'TBD'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400 mr-2" />
                      {match.courtName || 'TBD'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {match.drawName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {match.round}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <button
                      onClick={(e) => match.player1Name && handlePlayerClick(match.player1Name, e)}
                      className="hover:text-blue-600 text-left"
                    >
                      {match.player1Name || 'TBD'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <button
                      onClick={(e) => match.player2Name && handlePlayerClick(match.player2Name, e)}
                      className="hover:text-blue-600 text-left"
                    >
                      {match.player2Name || 'TBD'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="font-mono">{match.score || '—'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                      {match.status === 'in-progress' ? 'LIVE' : 
                       match.status === 'completed' ? 'DONE' :
                       match.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleMatchClick(match)}
                        className="text-gray-400 hover:text-gray-600"
                        title="View Details"
                      >
                        <EllipsisVerticalIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {sortedMatches.length === 0 && (
          <div className="text-center py-12">
            <CalendarDaysIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' || drawFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'No matches scheduled for this date'}
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedMatches.length)} of {sortedMatches.length} matches
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum = i + 1
                  if (totalPages > 5) {
                    if (currentPage > 3) {
                      pageNum = currentPage - 2 + i
                      if (pageNum > totalPages) pageNum = totalPages - 4 + i
                    }
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === pageNum
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-6">
              <span>🏁 {dateMatches.filter(m => m.status === 'completed').length} completed</span>
              <span>🟡 {dateMatches.filter(m => m.status === 'in-progress').length} in progress</span>
              <span>📅 {dateMatches.filter(m => m.status === 'scheduled').length} scheduled</span>
              <span>⏸️ {dateMatches.filter(m => m.status === 'postponed').length} postponed</span>
            </div>
            <div>
              Total: {dateMatches.length} matches
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