import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Court } from '../../types/tournament'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

const Courts: React.FC = () => {
  const { state, addCourt, updateCourt, deleteCourt } = useTournament()
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

  const getSurfaceColor = (surface: string) => {
    switch (surface) {
      case 'hard': return 'bg-blue-100 text-blue-700'
      case 'clay': return 'bg-orange-100 text-orange-700'
      case 'grass': return 'bg-green-100 text-green-700'
      case 'carpet': return 'bg-purple-100 text-purple-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="courts-container h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Courts</h2>
              <p className="text-sm text-gray-600 mt-1">Manage tournament court resources</p>
            </div>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Court
            </button>
          </div>
        </div>
      </div>

      {/* Add Court Form */}
      {showAddForm && (
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Court Name</label>
              <input
                type="text"
                value={newCourt.name}
                onChange={(e) => setNewCourt(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Center Court"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Surface</label>
              <select
                value={newCourt.surface}
                onChange={(e) => setNewCourt(prev => ({ ...prev, surface: e.target.value as any }))}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="hard">Hard</option>
                <option value="clay">Clay</option>
                <option value="grass">Grass</option>
                <option value="carpet">Carpet</option>
              </select>
            </div>
            
            <div className="flex items-end space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newCourt.indoor}
                  onChange={(e) => setNewCourt(prev => ({ ...prev, indoor: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Indoor</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newCourt.isFinalsCourt}
                  onChange={(e) => setNewCourt(prev => ({ ...prev, isFinalsCourt: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Finals Court</span>
              </label>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
              <input
                type="text"
                value={newCourt.notes}
                onChange={(e) => setNewCourt(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={handleAddCourt}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false)
                  setNewCourt({ name: '', surface: 'hard', indoor: false, isFinalsCourt: false, notes: '' })
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Courts Table */}
      <div className="flex-1 overflow-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Court Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Surface
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matches
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Utilization
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {state.courts.map(court => {
              const utilization = getCourtUtilization(court.id)
              const isEditing = editingCourt === court.id
              
              return (
                <tr key={court.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={court.name}
                        onBlur={(e) => handleUpdateCourt(court.id, { name: e.target.value })}
                        className="px-2 py-1 text-sm border border-gray-300 rounded"
                        autoFocus
                      />
                    ) : (
                      <div>
                        <div className="text-sm font-medium text-gray-900">{court.name}</div>
                        {court.isFinalsCourt && (
                          <span className="text-xs text-amber-600">Finals Court</span>
                        )}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getSurfaceColor(court.surface)}`}>
                      {court.surface}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">
                      {court.indoor ? 'Indoor' : 'Outdoor'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{utilization.totalMatches}</div>
                    <div className="text-xs text-gray-500">
                      {utilization.completed} completed
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {utilization.inProgress > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse"></div>
                          {utilization.inProgress} Live
                        </span>
                      )}
                      {utilization.blockers > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          {utilization.blockers} Blocked
                        </span>
                      )}
                      {utilization.inProgress === 0 && utilization.blockers === 0 && (
                        <span className="text-xs text-gray-500">Available</span>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">{utilization.utilizationRate}%</div>
                      <div className="ml-3 w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${utilization.utilizationRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    {isEditing ? (
                      <input
                        type="text"
                        defaultValue={court.notes}
                        onBlur={(e) => handleUpdateCourt(court.id, { notes: e.target.value })}
                        className="px-2 py-1 text-sm border border-gray-300 rounded w-full"
                      />
                    ) : (
                      <span className="text-sm text-gray-600 truncate block max-w-xs">
                        {court.notes || '-'}
                      </span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingCourt(isEditing ? null : court.id)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourt(court.id)}
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
        
        {state.courts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="text-sm">No courts added yet</div>
            <div className="text-xs mt-2">Click "Add Court" to get started</div>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-6 text-gray-600">
            <span>Total Courts: <strong className="text-gray-900">{state.courts.length}</strong></span>
            <span>Indoor: <strong className="text-gray-900">{state.courts.filter(c => c.indoor).length}</strong></span>
            <span>Outdoor: <strong className="text-gray-900">{state.courts.filter(c => !c.indoor).length}</strong></span>
            <span>Active Matches: <strong className="text-green-600">
              {state.matches.filter(m => m.status === 'in-progress').length}
            </strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Courts