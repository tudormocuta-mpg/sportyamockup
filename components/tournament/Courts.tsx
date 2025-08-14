import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Court, Match, Blocker } from '../../types/tournament'
import { MapPinIcon, HomeIcon, SunIcon, TrophyIcon, ExclamationTriangleIcon, ClockIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, PlayIcon } from '@heroicons/react/24/outline'

const Courts: React.FC = () => {
  const { state, addCourt, updateCourt, deleteCourt } = useTournament()
  const [selectedCourt, setSelectedCourt] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCourt, setEditingCourt] = useState<string | null>(null)
  const [newCourt, setNewCourt] = useState({
    name: '',
    surface: 'hard' as const,
    indoor: false,
    isFinalsCourt: false,
    notes: ''
  })

  // Get court utilization data
  const getCourtUtilization = (courtId: string) => {
    const courtMatches = state.matches.filter(m => m.courtId === courtId)
    const totalScheduled = courtMatches.filter(m => m.scheduledTime).length
    const completed = courtMatches.filter(m => m.status === 'completed').length
    const inProgress = courtMatches.filter(m => m.status === 'in-progress').length
    const blockers = state.blockers.filter(b => b.courtId === courtId).length
    
    return {
      totalMatches: courtMatches.length,
      scheduled: totalScheduled,
      completed,
      inProgress,
      blockers,
      utilizationRate: totalScheduled > 0 ? Math.round((completed / totalScheduled) * 100) : 0
    }
  }

  // Get court availability for today
  const getCourtAvailability = (courtId: string) => {
    const todayMatches = state.matches.filter(m => 
      m.courtId === courtId && 
      m.scheduledDate === state.selectedDate &&
      m.scheduledTime
    )
    const todayBlockers = state.blockers.filter(b =>
      b.courtId === courtId &&
      b.date === state.selectedDate
    )
    
    const busySlots = [
      ...todayMatches.map(m => ({ time: m.scheduledTime!, type: 'match', duration: m.estimatedDuration || 90 })),
      ...todayBlockers.map(b => ({ time: b.startTime, type: 'blocker', duration: 60 }))
    ]
    
    return {
      matches: todayMatches.length,
      blockers: todayBlockers.length,
      busySlots: busySlots.length,
      nextAvailable: getNextAvailableSlot(busySlots)
    }
  }

  const getNextAvailableSlot = (busySlots: any[]): string => {
    const timeSlots = []
    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        timeSlots.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`)
      }
    }
    
    const busyTimes = busySlots.map(slot => slot.time)
    const availableSlot = timeSlots.find(slot => !busyTimes.includes(slot))
    return availableSlot || 'No slots available'
  }

  const handleAddCourt = () => {
    if (newCourt.name.trim()) {
      const courtData = {
        id: Date.now().toString(),
        ...newCourt
      }
      addCourt(courtData)
      setNewCourt({ name: '', surface: 'hard', indoor: false, isFinalsCourt: false, notes: '' })
      setShowAddForm(false)
    }
  }

  const handleUpdateCourt = (courtId: string, updates: Partial<Court>) => {
    updateCourt(courtId, updates)
    setEditingCourt(null)
  }

  const handleDeleteCourt = (courtId: string) => {
    if (confirm('Are you sure you want to delete this court? This will remove all associated matches and blockers.')) {
      deleteCourt(courtId)
    }
  }

  const getSurfaceIcon = (surface: string) => {
    switch (surface) {
      case 'hard': return '🏟️'
      case 'clay': return '🟫'
      case 'grass': return '🌱'
      case 'carpet': return '🟣'
      default: return '🏟️'
    }
  }

  const getSurfaceColor = (surface: string) => {
    switch (surface) {
      case 'hard': return 'bg-blue-100 text-blue-800'
      case 'clay': return 'bg-orange-100 text-orange-800'
      case 'grass': return 'bg-green-100 text-green-800'
      case 'carpet': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="courts-container h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Enhanced Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 p-6">
          <div className="flex justify-between items-center text-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <MapPinIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Court Management</h2>
                <p className="text-green-100">Manage court resources and availability</p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-3xl font-bold">{state.courts.length}</div>
              <div className="text-sm text-green-100">Total Courts</div>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <HomeIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">
                  {state.courts.filter(c => c.indoor).length} Indoor
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <SunIcon className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">
                  {state.courts.filter(c => !c.indoor).length} Outdoor
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                <TrophyIcon className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">
                  {state.courts.filter(c => c.isFinalsCourt).length} Finals Court
                </span>
              </div>
            </div>
            
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 font-medium flex items-center space-x-2 shadow-sm hover:shadow-md"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Add Court</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Court Form */}
      {showAddForm && (
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add New Court</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Court Name</label>
                <input
                  type="text"
                  value={newCourt.name}
                  onChange={(e) => setNewCourt(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Center Court"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Surface Type</label>
                <select
                  value={newCourt.surface}
                  onChange={(e) => setNewCourt(prev => ({ ...prev, surface: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="hard">Hard Court</option>
                  <option value="clay">Clay Court</option>
                  <option value="grass">Grass Court</option>
                  <option value="carpet">Carpet Court</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newCourt.indoor}
                    onChange={(e) => setNewCourt(prev => ({ ...prev, indoor: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Indoor</span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newCourt.isFinalsCourt}
                    onChange={(e) => setNewCourt(prev => ({ ...prev, isFinalsCourt: e.target.checked }))}
                    className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Finals Court</span>
                </label>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleAddCourt}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Add Court
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Court Grid */}
      <div className="flex-1 overflow-auto p-6 custom-scrollbar">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.courts.map(court => {
            const utilization = getCourtUtilization(court.id)
            const availability = getCourtAvailability(court.id)
            
            return (
              <div
                key={court.id}
                className={`court-card bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                  selectedCourt === court.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                }`}
                onClick={() => setSelectedCourt(selectedCourt === court.id ? null : court.id)}
              >
                {/* Court Header */}
                <div className={`p-6 rounded-t-xl ${
                  court.isFinalsCourt 
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                    : court.indoor 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                    : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                }`}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold flex items-center">
                        <span className="text-2xl mr-2">
                          {court.isFinalsCourt ? '👑' : court.indoor ? '🏠' : '🌤️'}
                        </span>
                        {court.name}
                      </h3>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className="flex items-center text-sm">
                          <span className="mr-1">{getSurfaceIcon(court.surface)}</span>
                          {court.surface.charAt(0).toUpperCase() + court.surface.slice(1)}
                        </span>
                        <span className="text-sm">
                          {court.indoor ? '🏠 Indoor' : '🌤️ Outdoor'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingCourt(court.id)
                        }}
                        className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                        title="Edit Court"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCourt(court.id)
                        }}
                        className="p-2 bg-white/20 rounded-lg hover:bg-red-500 transition-colors"
                        title="Delete Court"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {court.isFinalsCourt && (
                    <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                      <div className="text-sm font-medium">🏆 Finals Court</div>
                      <div className="text-xs opacity-90">Premium court for championship matches</div>
                    </div>
                  )}
                </div>

                {/* Utilization Stats */}
                <div className="p-6 space-y-4">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                      <TrophyIcon className="w-4 h-4 mr-2 text-blue-600" />
                      Tournament Utilization
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                        <div className="text-lg font-bold text-blue-600">{utilization.totalMatches}</div>
                        <div className="text-xs text-blue-800">Total Matches</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                        <div className="text-lg font-bold text-green-600">{utilization.completed}</div>
                        <div className="text-xs text-green-800">Completed</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 space-y-2 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Utilization Rate:</span>
                        <span className="font-bold text-gray-900">{utilization.utilizationRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${utilization.utilizationRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                      <ClockIcon className="w-4 h-4 mr-2 text-orange-600" />
                      Today's Schedule
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center">
                          <PlayIcon className="w-3 h-3 mr-2 text-blue-500" />
                          <span>Matches</span>
                        </div>
                        <span className="font-bold text-blue-600">{availability.matches}</span>
                      </div>
                      <div className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex items-center">
                          <ExclamationTriangleIcon className="w-3 h-3 mr-2 text-red-500" />
                          <span>Blockers</span>
                        </div>
                        <span className="font-bold text-red-600">{availability.blockers}</span>
                      </div>
                      <div className="bg-green-50 rounded-lg px-3 py-2 border border-green-200">
                        <div className="flex items-center">
                          <CheckCircleIcon className="w-3 h-3 mr-2 text-green-500" />
                          <span className="text-xs text-gray-700">Next Available:</span>
                        </div>
                        <div className="font-bold text-green-600 text-sm">{availability.nextAvailable}</div>
                      </div>
                    </div>
                  </div>

                  {court.notes && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-2">Notes</h4>
                      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-700">
                        {court.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Indicators */}
                <div className="px-6 pb-6">
                  <div className="flex flex-wrap gap-2">
                    {utilization.inProgress > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                        {utilization.inProgress} Live
                      </span>
                    )}
                    {utilization.blockers > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                        {utilization.blockers} Blocked
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSurfaceColor(court.surface)}`}>
                      {getSurfaceIcon(court.surface)} {court.surface}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Enhanced Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 border-t border-gray-200 shadow-inner">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-4 h-4 text-green-600" />
              <span className="font-medium text-gray-700">
                Total: <span className="font-bold text-green-600">{state.courts.length}</span> courts
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <TrophyIcon className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-700">
                Active Matches: <span className="font-bold text-blue-600">
                  {state.matches.filter(m => state.courts.some(c => c.id === m.courtId) && m.status === 'in-progress').length}
                </span>
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

export default Courts