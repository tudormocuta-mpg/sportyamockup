import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Blocker } from '../../types/tournament'

const Blockers: React.FC = () => {
  const { state, addBlocker, removeBlocker } = useTournament()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newBlocker, setNewBlocker] = useState({
    courtId: '',
    date: state.selectedDate,
    startTime: '',
    endTime: '',
    title: '',
    description: '',
    type: 'maintenance' as Blocker['type']
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const court = state.courts.find(c => c.id === newBlocker.courtId)
    if (court) {
      addBlocker({
        ...newBlocker,
        courtName: court.name
      })
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
  }

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'maintenance': return 'bg-red-100 text-red-800 border-red-200'
      case 'reserved': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'unavailable': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-orange-100 text-orange-800 border-orange-200'
    }
  }

  const dayBlockers = state.blockers.filter(blocker => blocker.date === state.selectedDate)

  return (
    <div className="blockers-container p-6 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Court Blockers</h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {showAddForm ? 'Cancel' : 'Add Blocker'}
        </button>
      </div>

      {/* Add Blocker Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Court</label>
                <select
                  value={newBlocker.courtId}
                  onChange={(e) => setNewBlocker(prev => ({ ...prev, courtId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Court</option>
                  {state.courts.map(court => (
                    <option key={court.id} value={court.id}>{court.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newBlocker.type}
                  onChange={(e) => setNewBlocker(prev => ({ ...prev, type: e.target.value as Blocker['type'] }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                  <option value="unavailable">Unavailable</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  value={newBlocker.date}
                  onChange={(e) => setNewBlocker(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                <input
                  type="time"
                  value={newBlocker.startTime}
                  onChange={(e) => setNewBlocker(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                <input
                  type="time"
                  value={newBlocker.endTime}
                  onChange={(e) => setNewBlocker(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newBlocker.title}
                onChange={(e) => setNewBlocker(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Court Maintenance"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={newBlocker.description}
                onChange={(e) => setNewBlocker(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={2}
                placeholder="Optional description"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Add Blocker
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blockers List */}
      <div className="space-y-4">
        {dayBlockers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No blockers for {new Date(state.selectedDate).toLocaleDateString()}</p>
          </div>
        ) : (
          dayBlockers.map(blocker => (
            <div key={blocker.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-medium text-gray-900">{blocker.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getTypeColor(blocker.type)}`}>
                      {blocker.type}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <strong>Court:</strong> {blocker.courtName}
                    </div>
                    <div>
                      <strong>Time:</strong> {blocker.startTime} - {blocker.endTime}
                    </div>
                    {blocker.description && (
                      <div>
                        <strong>Description:</strong> {blocker.description}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeBlocker(blocker.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                  title="Remove blocker"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Blockers