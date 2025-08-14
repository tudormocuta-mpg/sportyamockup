import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Match, MatchStatus } from '../../types/tournament'

interface MatchDetailsCardProps {
  match: Match
}

const MatchDetailsCard: React.FC<MatchDetailsCardProps> = ({ match }) => {
  const { state, updateMatch, updateMatchStatus } = useTournament()
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    scheduledTime: match.scheduledTime || '',
    courtId: match.courtId || '',
    score: match.score || '',
    notes: match.notes || '',
    priority: match.priority || 'medium'
  })

  // Handle form submission
  const handleSave = () => {
    const court = state.courts.find(c => c.id === editForm.courtId)
    
    updateMatch(match.id, {
      scheduledTime: editForm.scheduledTime,
      courtId: editForm.courtId,
      courtName: court?.name,
      score: editForm.score,
      notes: editForm.notes,
      priority: editForm.priority as 'high' | 'medium' | 'low'
    })
    
    setIsEditing(false)
  }

  // Handle cancel
  const handleCancel = () => {
    setEditForm({
      scheduledTime: match.scheduledTime || '',
      courtId: match.courtId || '',
      score: match.score || '',
      notes: match.notes || '',
      priority: match.priority || 'medium'
    })
    setIsEditing(false)
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

  // Get priority color
  const getPriorityColor = (priority?: string): string => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-700 border-green-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  // Format player names
  const formatPlayers = (): string => {
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
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">{match.drawName}</h4>
          <p className="text-sm text-gray-600">{match.roundName}</p>
        </div>
        
        <div className="text-lg font-medium text-gray-800">
          {formatPlayers()}
          {match.isDoubles && (
            <span className="ml-2 text-sm text-gray-500">(Doubles)</span>
          )}
        </div>
      </div>

      {/* Status and Priority */}
      <div className="flex space-x-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">STATUS</label>
          {isEditing ? (
            <select
              value={match.status}
              onChange={(e) => updateMatchStatus(match.id, e.target.value as MatchStatus)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="postponed">Postponed</option>
              <option value="walkover">Walkover</option>
            </select>
          ) : (
            <div className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(match.status)}`}>
              {match.status.replace('-', ' ').toUpperCase()}
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">PRIORITY</label>
          {isEditing ? (
            <select
              value={editForm.priority}
              onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value }))}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          ) : (
            <div className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(match.priority)}`}>
              {(match.priority || 'medium').toUpperCase()}
            </div>
          )}
        </div>
      </div>

      {/* Scheduling Details */}
      <div className="space-y-4">
        <h5 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">
          Scheduling Details
        </h5>

        {/* Date */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">DATE</label>
          <div className="text-sm text-gray-900">
            {match.scheduledDate ? new Date(match.scheduledDate).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Not scheduled'}
          </div>
        </div>

        {/* Time */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">TIME</label>
          {isEditing ? (
            <input
              type="time"
              value={editForm.scheduledTime}
              onChange={(e) => setEditForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          ) : (
            <div className="text-sm text-gray-900">
              {match.scheduledTime || 'TBD'}
            </div>
          )}
        </div>

        {/* Court */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">COURT</label>
          {isEditing ? (
            <select
              value={editForm.courtId}
              onChange={(e) => setEditForm(prev => ({ ...prev, courtId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">Select Court</option>
              {state.courts.map(court => (
                <option key={court.id} value={court.id}>
                  {court.name} ({court.surface})
                </option>
              ))}
            </select>
          ) : (
            <div className="text-sm text-gray-900">
              {match.courtName || 'TBD'}
              {match.courtName && (
                <div className="text-xs text-gray-500 mt-1">
                  {state.courts.find(c => c.id === match.courtId)?.surface} • {' '}
                  {state.courts.find(c => c.id === match.courtId)?.indoor ? 'Indoor' : 'Outdoor'}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">ESTIMATED DURATION</label>
          <div className="text-sm text-gray-900">
            {match.estimatedDuration ? `${match.estimatedDuration} minutes` : 'Not specified'}
          </div>
        </div>
      </div>

      {/* Score */}
      {(match.status === 'completed' || match.status === 'in-progress') && (
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-2">SCORE</label>
          {isEditing ? (
            <input
              type="text"
              value={editForm.score}
              onChange={(e) => setEditForm(prev => ({ ...prev, score: e.target.value }))}
              placeholder="e.g., 6-4, 6-2"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          ) : (
            <div className="text-sm text-gray-900 font-mono">
              {match.score || 'No score entered'}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-2">NOTES</label>
        {isEditing ? (
          <textarea
            value={editForm.notes}
            onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            placeholder="Add match notes..."
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        ) : (
          <div className="text-sm text-gray-900 min-h-12">
            {match.notes || 'No notes'}
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="pt-4 border-t border-gray-200 space-y-2 text-xs text-gray-500">
        <div>Match ID: {match.id}</div>
        <div>Created: {match.createdAt.toLocaleDateString()}</div>
        <div>Updated: {match.updatedAt.toLocaleDateString()}</div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-gray-200">
        {isEditing ? (
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Save Changes
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Edit Match
          </button>
        )}
      </div>
    </div>
  )
}

export default MatchDetailsCard