import React, { useState, useMemo } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Blocker } from '../../types/tournament'
import { ExclamationTriangleIcon, PlusIcon, TrashIcon, PencilIcon, ClockIcon, MapPinIcon, CalendarDaysIcon, FunnelIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

const Blockers: React.FC = () => {
  const { state, addBlocker, removeBlocker } = useTournament()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingBlocker, setEditingBlocker] = useState<string | null>(null)
  const [filterType, setFilterType] = useState<Blocker['type'] | 'all'>('all')
  const [filterDate, setFilterDate] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  
  const [newBlocker, setNewBlocker] = useState({
    courtId: '',
    date: state.selectedDate,
    startTime: '',
    endTime: '',
    title: '',
    description: '',
    type: 'maintenance' as Blocker['type']
  })

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

    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(blocker =>
        blocker.title.toLowerCase().includes(search) ||
        blocker.description?.toLowerCase().includes(search) ||
        blocker.courtName?.toLowerCase().includes(search)
      )
    }

    return filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.startTime.localeCompare(b.startTime)
    })
  }, [state.blockers, filterType, filterDate, searchTerm])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const court = state.courts.find(c => c.id === newBlocker.courtId)
    if (court) {
      addBlocker({
        ...newBlocker,
        courtName: court.name
      })
      resetForm()
    }
  }

  const resetForm = () => {
    setNewBlocker({
      courtId: '',
      date: state.selectedDate,
      startTime: '',
      endTime: '',
      title: '',
      description: '',
      type: 'maintenance'
    })
    setShowAddForm(false)
  }

  const clearFilters = () => {
    setFilterType('all')
    setFilterDate('all')
    setSearchTerm('')
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'maintenance': return 'bg-red-100 text-red-800 border-red-200'
      case 'reserved': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'unavailable': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  const getTypeIcon = (type: string): string => {
    switch (type) {
      case 'maintenance': return '🔧'
      case 'reserved': return '🔒'
      case 'unavailable': return '⛔'
      default: return '❓'
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
    <div className="blockers-container h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Court Blockers</h2>
                <p className="text-red-100">Manage court availability and restrictions</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{blockerStats.total}</div>
              <div className="text-sm text-red-100">Total Blockers</div>
            </div>
          </div>
        </div>
        
        {/* Stats Overview */}
        <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(blockerStats).slice(1).map(([type, count]) => (
              <div key={type} className={`bg-white rounded-xl p-4 text-center shadow-sm border-2 transition-all hover:shadow-md ${getTypeColor(type)}`}>
                <div className="text-2xl mb-1">{getTypeIcon(type)}</div>
                <div className="text-xl font-bold">{count}</div>
                <div className="text-xs font-medium capitalize">{type}</div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-80">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search blockers by title, description, or court..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="pl-9 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm font-medium"
                >
                  <option value="all">All Types</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <select
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white shadow-sm font-medium"
              >
                <option value="all">All Dates</option>
                {availableDates.map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  </option>
                ))}
              </select>
              
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center space-x-2"
                title="Clear all filters"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Reset</span>
              </button>
              
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg hover:from-red-600 hover:to-orange-600 transition-all duration-200 font-medium flex items-center space-x-2 shadow-sm hover:shadow-md"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Blocker</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Blocker Form */}
      {showAddForm && (
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Blocker</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  required
                  value={newBlocker.title}
                  onChange={(e) => setNewBlocker(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Court Maintenance"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Court</label>
                <select
                  required
                  value={newBlocker.courtId}
                  onChange={(e) => setNewBlocker(prev => ({ ...prev, courtId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select Court</option>
                  {state.courts.map(court => (
                    <option key={court.id} value={court.id}>{court.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={newBlocker.type}
                  onChange={(e) => setNewBlocker(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="maintenance">🔧 Maintenance</option>
                  <option value="reserved">🔒 Reserved</option>
                  <option value="unavailable">⛔ Unavailable</option>
                  <option value="other">❓ Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={newBlocker.date}
                  onChange={(e) => setNewBlocker(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                <input
                  type="time"
                  required
                  value={newBlocker.startTime}
                  onChange={(e) => setNewBlocker(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                <input
                  type="time"
                  required
                  value={newBlocker.endTime}
                  onChange={(e) => setNewBlocker(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newBlocker.description}
                  onChange={(e) => setNewBlocker(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description or notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              
              <div className="md:col-span-2 lg:col-span-3 flex space-x-3">
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Add Blocker
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blockers List */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="space-y-4">
          {filteredBlockers.map(blocker => {
            const conflicts = getBlockerConflicts(blocker)
            return (
              <div
                key={blocker.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">{getTypeIcon(blocker.type)}</div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{blocker.title}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {blocker.courtName}
                          </div>
                          <div className="flex items-center">
                            <CalendarDaysIcon className="w-4 h-4 mr-1" />
                            {new Date(blocker.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          </div>
                          <div className="flex items-center">
                            <ClockIcon className="w-4 h-4 mr-1" />
                            {blocker.startTime} - {blocker.endTime}
                          </div>
                          <div className="font-medium text-blue-600">
                            ({getDuration(blocker.startTime, blocker.endTime)})
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {blocker.description && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <div className="text-sm text-gray-800">{blocker.description}</div>
                      </div>
                    )}
                    
                    {conflicts > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center text-red-800">
                          <ExclamationTriangleIcon className="w-4 h-4 mr-2" />
                          <span className="text-sm font-bold">
                            Conflict Warning: {conflicts} match{conflicts !== 1 ? 'es' : ''} scheduled during this time
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-3">
                    <div className={`px-4 py-2 rounded-xl border-2 font-bold text-sm ${getTypeColor(blocker.type)}`}>
                      {blocker.type.charAt(0).toUpperCase() + blocker.type.slice(1)}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingBlocker(blocker.id)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Edit Blocker"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this blocker?')) {
                            removeBlocker(blocker.id)
                          }
                        }}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Delete Blocker"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
          
          {filteredBlockers.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ExclamationTriangleIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blockers found</h3>
              <p className="text-gray-600">Try adjusting your filters or add a new blocker.</p>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Summary */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 border-t border-gray-200 shadow-inner">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
              <span className="font-medium text-gray-700">
                Showing: <span className="font-bold text-red-600">{filteredBlockers.length}</span> of <span className="font-bold">{blockerStats.total}</span> blockers
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="font-medium text-gray-700">
                <span className="font-bold text-red-600">{blockerStats.maintenance}</span> maintenance
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

export default Blockers