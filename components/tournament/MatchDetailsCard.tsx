import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Match, MatchStatus } from '../../types/tournament'
import { ClockIcon, MapPinIcon, TrophyIcon, ExclamationTriangleIcon, CheckCircleIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'

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
    priority: 'medium' // Default priority since not in match type
  })

  // Handle form submission
  const handleSave = () => {
    const court = state.courts.find(c => c.id === editForm.courtId)
    
    updateMatch(match.id, {
      scheduledTime: editForm.scheduledTime,
      courtId: editForm.courtId,
      courtName: court?.name,
      score: editForm.score,
      notes: editForm.notes
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
      priority: 'medium' // Default priority since not in match type
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
    <div className="h-full overflow-auto custom-scrollbar">
      <div className="p-4 space-y-6">
        {/* Enhanced Header */}
        <div className="space-y-4 bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-gray-900">{match.drawName}</h4>
              <p className="text-sm text-gray-600 font-medium">{match.roundName}</p>
            </div>
            <TrophyIcon className="w-8 h-8 text-yellow-500" />
          </div>
          
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <div className="text-lg font-bold text-gray-800 text-center">
              {formatPlayers()}
              {match.gameType === 'Doubles' && (
                <span className="ml-2 text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">(Doubles)</span>
              )}
            </div>
            {match.score && (
              <div className="text-2xl font-bold text-center text-blue-600 mt-2">
                {match.score}
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <label className="flex items-center text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
              {match.status === 'in-progress' ? <PlayIcon className="w-4 h-4 mr-1" /> :
               match.status === 'completed' ? <CheckCircleIcon className="w-4 h-4 mr-1" /> :
               match.status === 'postponed' ? <PauseIcon className="w-4 h-4 mr-1" /> :
               <ClockIcon className="w-4 h-4 mr-1" />}
              Status
            </label>
            {isEditing ? (
              <select
                value={match.status}
                onChange={(e) => updateMatchStatus(match.id, e.target.value as MatchStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="postponed">Postponed</option>
                <option value="walkover">Walkover</option>
              </select>
            ) : (
              <div className={`px-3 py-2 rounded-lg text-sm font-bold border-2 ${getStatusColor(match.status)} flex items-center justify-center`}>
                {match.status === 'in-progress' && <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>}
                {match.status.replace('-', ' ').toUpperCase()}
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <label className="flex items-center text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
              <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
              Priority
            </label>
            {isEditing ? (
              <select
                value={editForm.priority}
                onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as 'high' | 'medium' | 'low' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            ) : (
              <div className={`px-3 py-2 rounded-lg text-sm font-bold border-2 ${getPriorityColor('medium')} flex items-center justify-center`}>
                MEDIUM
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Scheduling Details */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <h5 className="text-lg font-bold text-gray-900 border-b-2 border-blue-200 pb-3 flex items-center">
            <ClockIcon className="w-5 h-5 mr-2 text-blue-600" />
            Scheduling Details
          </h5>

          {/* Date */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="flex items-center text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
              📅 Date
            </label>
            <div className="text-sm font-medium text-gray-900">
              {match.scheduledDate ? new Date(match.scheduledDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Not scheduled'}
            </div>
          </div>

          {/* Time */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="flex items-center text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
              <ClockIcon className="w-4 h-4 mr-1" /> Time
            </label>
            {isEditing ? (
              <input
                type="time"
                value={editForm.scheduledTime}
                onChange={(e) => setEditForm(prev => ({ ...prev, scheduledTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
            ) : (
              <div className="text-sm font-bold text-gray-900 bg-white px-3 py-2 rounded border">
                {match.scheduledTime || 'TBD'}
              </div>
            )}
          </div>

          {/* Court */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="flex items-center text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
              <MapPinIcon className="w-4 h-4 mr-1" /> Court
            </label>
            {isEditing ? (
              <select
                value={editForm.courtId}
                onChange={(e) => setEditForm(prev => ({ ...prev, courtId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              >
                <option value="">Select Court</option>
                {state.courts.map(court => (
                  <option key={court.id} value={court.id}>
                    {court.name} ({court.surface})
                  </option>
                ))}
              </select>
            ) : (
              <div className="bg-white px-3 py-2 rounded border">
                <div className="text-sm font-bold text-gray-900">
                  {match.courtName || 'TBD'}
                </div>
                {match.courtName && (
                  <div className="text-xs text-gray-600 mt-1 flex items-center">
                    <span className="bg-gray-200 px-2 py-1 rounded mr-2">
                      {state.courts.find(c => c.id === match.courtId)?.surface}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      state.courts.find(c => c.id === match.courtId)?.indoor 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {state.courts.find(c => c.id === match.courtId)?.indoor ? '🏠 Indoor' : '🌤️ Outdoor'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Duration */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="flex items-center text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">
              ⏱️ Estimated Duration
            </label>
            <div className="text-sm font-bold text-gray-900 bg-white px-3 py-2 rounded border">
              {match.estimatedDuration ? `${match.estimatedDuration} minutes` : 'Not specified'}
            </div>
          </div>
        </div>

        {/* Enhanced Score */}
        {(match.status === 'completed' || match.status === 'in-progress') && (
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <label className="flex items-center text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">
              🎾 Match Score
            </label>
            {isEditing ? (
              <input
                type="text"
                value={editForm.score}
                onChange={(e) => setEditForm(prev => ({ ...prev, score: e.target.value }))}
                placeholder="e.g., 6-4, 6-2"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg font-mono"
              />
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 font-mono bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                  {match.score || 'No score entered'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Enhanced Notes */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <label className="flex items-center text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">
            📝 Match Notes
          </label>
          {isEditing ? (
            <textarea
              value={editForm.notes}
              onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              placeholder="Add match notes, special instructions, or observations..."
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
            />
          ) : (
            <div className="text-sm text-gray-900 min-h-16 bg-gray-50 p-3 rounded-lg border">
              {match.notes || 'No notes added yet...'}
            </div>
          )}
        </div>

        {/* Enhanced Metadata */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h6 className="text-xs font-bold text-gray-600 mb-3 uppercase tracking-wide">📊 Match Information</h6>
          <div className="grid grid-cols-1 gap-2 text-xs">
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Match ID:</span>
              <span className="font-mono font-medium text-gray-900">{match.id}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium text-gray-900">{match.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Last Updated:</span>
              <span className="font-medium text-gray-900">{match.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
          </div>
        </div>

        {/* Enhanced Action Buttons */}
        <div className="pt-4">
          {isEditing ? (
            <div className="flex space-x-3">
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 text-sm font-bold shadow-lg transform hover:scale-105 flex items-center justify-center"
              >
                <CheckCircleIcon className="w-5 h-5 mr-2" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-all duration-200 text-sm font-bold shadow-lg transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 text-sm font-bold shadow-lg transform hover:scale-105 flex items-center justify-center"
            >
              ✏️ Edit Match Details
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default MatchDetailsCard