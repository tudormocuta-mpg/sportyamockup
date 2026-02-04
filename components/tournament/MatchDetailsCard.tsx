import React, { useState, useEffect } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { Match, MatchStatus } from '../../types/tournament'
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface MatchDetailsCardProps {
  match: Match
  onClose?: () => void
}

const MatchDetailsCard: React.FC<MatchDetailsCardProps> = ({ match, onClose }) => {
  const { state, updateMatch } = useTournament()
  
  // Initialize form with match data - this will reset when match prop changes
  const [editForm, setEditForm] = useState({
    scheduledTime: match.scheduledTime || '',
    scheduledDate: match.scheduledDate || '',
    courtId: match.courtId || '',
    score: match.score || '',
    notes: match.notes || ''
  })
  
  const [validationError, setValidationError] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Parse existing score into sets for editing
  const parseScore = (scoreString: string) => {
    if (!scoreString) return { sets: [['', ''], ['', ''], ['', '']] }
    const sets = scoreString.split(', ').map(set => {
      const [p1, p2] = set.split('-')
      return [p1 || '', p2 || '']
    })
    while (sets.length < 3) {
      sets.push(['', ''])
    }
    return { sets }
  }
  
  const [scoreForm, setScoreForm] = useState(parseScore(match.score || ''))
  
  // Reset form when match changes
  useEffect(() => {
    setEditForm({
      scheduledTime: match.scheduledTime || '',
      scheduledDate: match.scheduledDate || '',
      courtId: match.courtId || '',
      score: match.score || '',
      notes: match.notes || ''
    })
    setScoreForm(parseScore(match.score || ''))
    setHasChanges(false)
    setValidationError(null)
  }, [match.id, match.scheduledTime, match.scheduledDate, match.courtId, match.score, match.notes])
  
  // Check if form has changes
  useEffect(() => {
    const hasFormChanges = 
      editForm.scheduledTime !== (match.scheduledTime || '') ||
      editForm.scheduledDate !== (match.scheduledDate || '') ||
      editForm.courtId !== (match.courtId || '') ||
      editForm.score !== (match.score || '') ||
      editForm.notes !== (match.notes || '')
    
    setHasChanges(hasFormChanges)
  }, [editForm, match])
  
  // Handle set score input - auto-complete winner's score
  const handleSetScoreChange = (setIndex: number, playerIndex: number, value: string) => {
    const newSets = [...scoreForm.sets]
    const numValue = parseInt(value)
    
    if (value === '') {
      // Clear both scores if deleting
      newSets[setIndex] = ['', '']
    } else if (!isNaN(numValue) && numValue >= 0 && numValue <= 7) {
      if (playerIndex === 0) {
        newSets[setIndex][0] = value
        // Auto-fill winner's score
        if (numValue <= 5) {
          newSets[setIndex][1] = '6'
        } else if (numValue === 6) {
          newSets[setIndex][1] = '7' // Tiebreak
        } else if (numValue === 7) {
          newSets[setIndex][1] = '6' // Lost tiebreak
        }
      } else {
        newSets[setIndex][1] = value
        // Auto-fill winner's score
        if (numValue <= 5) {
          newSets[setIndex][0] = '6'
        } else if (numValue === 6) {
          newSets[setIndex][0] = '7' // Tiebreak
        } else if (numValue === 7) {
          newSets[setIndex][0] = '6' // Lost tiebreak
        }
      }
    }
    
    setScoreForm({ sets: newSets })
    
    // Format score string
    const scoreString = newSets
      .filter(set => set[0] !== '' || set[1] !== '')
      .map(set => `${set[0]}-${set[1]}`)
      .join(', ')
    
    setEditForm(prev => ({ ...prev, score: scoreString }))
  }

  // Check for conflicts when changing time or court
  const checkConflicts = (courtId: string, date: string, time: string): string | null => {
    if (!courtId || !date || !time) return null

    // Check for other matches at the same time on the same court
    const conflictingMatch = state.matches.find(m => 
      m.id !== match.id &&
      m.courtId === courtId &&
      m.scheduledDate === date &&
      m.scheduledTime === time
    )

    if (conflictingMatch) {
      return `Court conflict: ${conflictingMatch.player1Name} vs ${conflictingMatch.player2Name} is already scheduled at this time`
    }

    // Check for blockers
    const courtBlockers = state.blockers.filter(b => 
      b.courtId === courtId && 
      b.date === date
    )

    for (const blocker of courtBlockers) {
      if (time >= blocker.startTime && time < blocker.endTime) {
        return `Court blocked: ${blocker.title} from ${blocker.startTime} to ${blocker.endTime}`
      }
    }

    // Check for player double-booking (if players are assigned)
    const playerIds = [match.player1Id, match.player2Id].filter(Boolean)
    for (const playerId of playerIds) {
      const playerConflict = state.matches.find(m => 
        m.id !== match.id &&
        (m.player1Id === playerId || m.player2Id === playerId) &&
        m.scheduledDate === date &&
        m.scheduledTime === time
      )
      
      if (playerConflict) {
        const player = state.players.find(p => p.id === playerId)
        return `Player conflict: ${player?.firstName} ${player?.lastName} has another match at this time`
      }
    }

    return null
  }

  const handleSave = () => {
    // Validate conflicts
    const conflict = checkConflicts(editForm.courtId, editForm.scheduledDate, editForm.scheduledTime)
    if (conflict) {
      setValidationError(conflict)
      return
    }

    const court = state.courts.find(c => c.id === editForm.courtId)
    
    // Determine status based on score entry
    let newStatus = match.status
    if (editForm.score && editForm.score.trim() !== '' && match.status !== 'completed') {
      newStatus = 'completed'
    }
    
    // Update the match with new data
    updateMatch(match.id, {
      scheduledTime: editForm.scheduledTime,
      scheduledDate: editForm.scheduledDate,
      courtId: editForm.courtId,
      courtName: court?.name,
      score: editForm.score,
      notes: editForm.notes,
      status: newStatus
    })
    
    setHasChanges(false)
    setValidationError(null)
  }

  const handleTimeChange = (value: string) => {
    setEditForm(prev => ({ ...prev, scheduledTime: value }))
    const conflict = checkConflicts(editForm.courtId, editForm.scheduledDate, value)
    setValidationError(conflict)
  }

  const handleCourtChange = (value: string) => {
    setEditForm(prev => ({ ...prev, courtId: value }))
    const conflict = checkConflicts(value, editForm.scheduledDate, editForm.scheduledTime)
    setValidationError(conflict)
  }

  const getStatusColor = (status: MatchStatus): string => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700'
      case 'in-progress': return 'bg-green-100 text-green-700'
      case 'completed': return 'bg-gray-100 text-gray-700'
      case 'postponed': return 'bg-yellow-100 text-yellow-700'
      case 'walkover': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div style={{ width: '420px', maxWidth: '420px', overflow: 'hidden' }} className="bg-white border-l border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex justify-between items-start">
          <div className="min-w-0 flex-1 mr-2">
            <h2 className="text-base font-semibold text-gray-900">Match Details</h2>
            <p className="text-xs text-gray-600 mt-0.5 truncate">{match.drawName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded transition-colors flex-shrink-0"
            title="Close"
          >
            <XMarkIcon className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Content - Vertical scroll only */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Players */}
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Players</h3>
          <div className="bg-gray-50 rounded p-3">
            <div className="text-center">
              <div className="text-sm font-semibold text-gray-900">
                <div className="truncate">{match.player1Name || 'TBD'}</div>
                <span className="text-gray-400 mx-1">vs</span>
                <div className="truncate">{match.player2Name || 'TBD'}</div>
              </div>
              {match.gameType === 'Doubles' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700 mt-1">
                  Doubles
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status and Round - Read only */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Status</h3>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
              {match.status === 'in-progress' && (
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
              )}
              {match.status.replace('-', ' ')}
            </span>
          </div>
          
          <div>
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Round</h3>
            <div className="text-sm font-medium text-gray-900 truncate">{match.roundName}</div>
          </div>
        </div>

        {/* Schedule Information - Always Editable */}
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Schedule</h3>
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Date</label>
                <div className="text-sm font-medium text-gray-900">
                  {match.scheduledDate ? 
                    new Date(match.scheduledDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    }) : 'Not scheduled'
                  }
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-0.5">Time</label>
                <input
                  type="time"
                  value={editForm.scheduledTime}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  className={`block w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 ${
                    validationError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-0.5">Court</label>
              <select
                value={editForm.courtId}
                onChange={(e) => handleCourtChange(e.target.value)}
                className={`block w-full px-2 py-1 text-sm border rounded focus:outline-none focus:ring-1 ${
                  validationError ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
                }`}
              >
                <option value="">Select Court</option>
                {state.courts.map(court => (
                  <option key={court.id} value={court.id}>
                    {court.name} ({court.surface})
                  </option>
                ))}
              </select>
            </div>

            {/* Validation Error */}
            {validationError && (
              <div className="flex items-start gap-2 p-2 bg-red-50 border border-red-200 rounded">
                <ExclamationTriangleIcon className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-red-700" style={{ wordBreak: 'break-word' }}>{validationError}</p>
              </div>
            )}
          </div>
        </div>

        {/* Results Module - Always Editable */}
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Results</h3>
          <div className="space-y-3">
            {/* Player/Team Names Header */}
            <div className="grid grid-cols-4 gap-1 text-xs font-medium">
              <div></div>
              <div className="text-center text-gray-700">Set 1</div>
              <div className="text-center text-gray-700">Set 2</div>
              <div className="text-center text-gray-700">Set 3</div>
            </div>
            
            {/* Player 1 Score Row */}
            <div className="grid grid-cols-4 gap-1 items-center">
              <div className="text-xs font-medium text-gray-900 truncate pr-1">
                {match.player1Name || 'Player 1'}
              </div>
              {[0, 1, 2].map((setIndex) => (
                <input
                  key={`p1-set-${setIndex}`}
                  type="text"
                  value={scoreForm.sets[setIndex][0]}
                  onChange={(e) => handleSetScoreChange(setIndex, 0, e.target.value)}
                  className="w-full px-1 py-1 text-center text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="-"
                  maxLength={1}
                />
              ))}
            </div>
            
            {/* Player 2 Score Row */}
            <div className="grid grid-cols-4 gap-1 items-center">
              <div className="text-xs font-medium text-gray-900 truncate pr-1">
                {match.player2Name || 'Player 2'}
              </div>
              {[0, 1, 2].map((setIndex) => (
                <input
                  key={`p2-set-${setIndex}`}
                  type="text"
                  value={scoreForm.sets[setIndex][1]}
                  onChange={(e) => handleSetScoreChange(setIndex, 1, e.target.value)}
                  className="w-full px-1 py-1 text-center text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="-"
                  maxLength={1}
                />
              ))}
            </div>
            
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded p-2">
              <p className="text-xs text-blue-700">
                <strong>Tip:</strong> For each set, enter the games won by the losing player/team first. The winner's score (6 or 7) will be auto-filled.
              </p>
            </div>
            
            {/* Current Score Display */}
            {editForm.score && (
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">Final Score:</div>
                <div className="text-sm font-semibold text-gray-900">{editForm.score}</div>
              </div>
            )}
          </div>
        </div>

        {/* Notes - Always Editable */}
        <div>
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">Notes</h3>
          <textarea
            value={editForm.notes}
            onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
            rows={2}
            placeholder="Add match notes..."
            className="block w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
          />
        </div>

        {/* Metadata */}
        <div className="text-xs text-gray-500 space-y-0.5 pt-2 border-t">
          <div className="flex justify-between gap-2">
            <span className="flex-shrink-0">Match ID:</span>
            <span className="font-mono truncate">{match.id}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="flex-shrink-0">Duration:</span>
            <span className="flex-shrink-0">{match.estimatedDuration ? `${match.estimatedDuration} min` : 'N/A'}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="flex-shrink-0">Last update:</span>
            <span className="flex-shrink-0">
              {match.updatedAt ? 
                `${new Date(match.updatedAt).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric'
                })} at ${new Date(match.updatedAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit'
                })}` : 'Never'}
            </span>
          </div>
        </div>
      </div>

      {/* Actions - Only Save Button */}
      <div className="border-t p-3 bg-gray-50">
        <button
          onClick={handleSave}
          disabled={!!validationError}
          className={`w-full px-3 py-1.5 text-sm rounded font-medium transition-all ${
            validationError 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : hasChanges
              ? 'bg-blue-600 text-white hover:bg-blue-700 animate-pulse'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

export default MatchDetailsCard