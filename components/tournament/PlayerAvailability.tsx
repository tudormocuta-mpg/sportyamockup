import { useState } from 'react'
import {
  UserIcon,
  ClockIcon,
  CalendarDaysIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline'
import { useTournament } from '@/contexts/TournamentContext'
import { PlayerAvailability as PlayerAvailabilityType, Player } from '@/types/tournament'

export default function PlayerAvailability() {
  const { state, updatePlayerAvailability } = useTournament()
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'morning' | 'daytime' | 'evening'>('all')
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Get tournament days
  const getTournamentDays = () => {
    const startDate = new Date(state.startDate)
    const endDate = new Date(state.endDate)
    const days = []
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      days.push({
        date: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
      })
    }
    
    return days
  }

  const tournamentDays = getTournamentDays()

  const periods = [
    { id: 'morning', name: 'Morning', time: 'up to 11:00', color: 'bg-blue-100 text-blue-800' },
    { id: 'daytime', name: 'Daytime', time: '11:00-17:00', color: 'bg-green-100 text-green-800' },
    { id: 'evening', name: 'Evening', time: 'after 17:00', color: 'bg-purple-100 text-purple-800' },
  ]

  // Filter players based on search and availability
  const filteredPlayers = state.players.filter(player => {
    const matchesSearch = searchQuery === '' || 
      `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    
    if (!matchesSearch) return false

    if (filterPeriod === 'all') return true

    // Check if player has availability for the filtered period on any day
    return Object.values(player.availability).some(dayAvailability => 
      dayAvailability.includes(filterPeriod as any)
    )
  })

  const handlePlayerAvailabilityChange = (playerId: string, day: string, period: 'morning' | 'daytime' | 'evening', isAvailable: boolean) => {
    const player = state.players.find(p => p.id === playerId)
    if (!player) return

    const currentDayAvailability = player.availability[day] || []
    let newAvailability

    if (isAvailable) {
      // Add period if not already included
      newAvailability = [...currentDayAvailability.filter(p => p !== period), period]
    } else {
      // Remove period
      newAvailability = currentDayAvailability.filter(p => p !== period)
    }

    updatePlayerAvailability({
      playerId,
      date: day,
      periods: newAvailability
    })

    setHasUnsavedChanges(true)
  }

  const getPlayerAvailabilityForDay = (player: Player, day: string) => {
    return player.availability[day] || []
  }

  const getAvailabilityStats = () => {
    let totalSlots = state.players.length * tournamentDays.length * periods.length
    let filledSlots = 0

    state.players.forEach(player => {
      tournamentDays.forEach(day => {
        const dayAvailability = player.availability[day.date] || []
        filledSlots += dayAvailability.length
      })
    })

    return {
      totalSlots,
      filledSlots,
      percentage: totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0
    }
  }

  const getConflicts = () => {
    const conflicts = []
    
    // Find players with no availability
    const playersWithNoAvailability = state.players.filter(player => 
      tournamentDays.every(day => 
        !player.availability[day.date] || player.availability[day.date].length === 0
      )
    )

    if (playersWithNoAvailability.length > 0) {
      conflicts.push({
        type: 'no-availability',
        message: `${playersWithNoAvailability.length} players have no availability set`,
        players: playersWithNoAvailability,
        severity: 'critical'
      })
    }

    // Find days with low availability
    tournamentDays.forEach(day => {
      const playersAvailable = state.players.filter(player => 
        player.availability[day.date] && player.availability[day.date].length > 0
      )
      
      if (playersAvailable.length < state.players.length * 0.5) {
        conflicts.push({
          type: 'low-availability',
          message: `Only ${playersAvailable.length} of ${state.players.length} players available on ${day.label}`,
          day: day.date,
          severity: 'warning'
        })
      }
    })

    return conflicts
  }

  const availabilityStats = getAvailabilityStats()
  const conflicts = getConflicts()

  const handleBulkUpdate = (period: 'morning' | 'daytime' | 'evening', available: boolean) => {
    filteredPlayers.forEach(player => {
      tournamentDays.forEach(day => {
        handlePlayerAvailabilityChange(player.id, day.date, period, available)
      })
    })
  }

  const renderPlayerAvailabilityRow = (player: Player) => (
    <div key={player.id} className="border border-gray-200 rounded-lg mb-4">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium mr-3">
              {player.firstName[0]}{player.lastName[0]}
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                {player.firstName} {player.lastName}
              </h4>
              <p className="text-sm text-gray-500">
                Singles: Level {player.sportyaLevelSingles} • Doubles: Level {player.sportyaLevelDoubles}
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedPlayer(selectedPlayer?.id === player.id ? null : player)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {selectedPlayer?.id === player.id ? 'Collapse' : 'Details'}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4">
          {tournamentDays.map(day => {
            const dayAvailability = getPlayerAvailabilityForDay(player, day.date)
            
            return (
              <div key={day.date} className="flex items-center justify-between">
                <div className="text-sm font-medium text-gray-700 w-32">
                  {day.label}
                </div>
                <div className="flex items-center space-x-4">
                  {periods.map(period => {
                    const isAvailable = dayAvailability.includes(period.id as any)
                    return (
                      <label key={period.id} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isAvailable}
                          onChange={(e) => handlePlayerAvailabilityChange(
                            player.id, 
                            day.date, 
                            period.id as any, 
                            e.target.checked
                          )}
                          className="mr-2"
                        />
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isAvailable ? period.color : 'bg-gray-100 text-gray-500'
                        }`}>
                          {period.name}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
        
        {selectedPlayer?.id === player.id && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2">{player.email}</span>
              </div>
              <div>
                <span className="text-gray-500">Phone:</span>
                <span className="ml-2">{player.phone}</span>
              </div>
              <div>
                <span className="text-gray-500">Joined:</span>
                <span className="ml-2">{new Date(player.joinedDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Matches Scheduled:</span>
                <span className="ml-2">
                  {state.matches.filter(m => m.player1Id === player.id || m.player2Id === player.id).length}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Player Availability</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage when players are available during the tournament
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowBulkUpdate(!showBulkUpdate)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Bulk Update
            </button>
            {hasUnsavedChanges && (
              <span className="text-sm text-green-600 font-medium">
                <CheckIcon className="h-4 w-4 inline mr-1" />
                Changes saved automatically
              </span>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Players</p>
                <p className="text-2xl font-bold text-blue-700">{state.players.length}</p>
              </div>
              <UserIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Availability Set</p>
                <p className="text-2xl font-bold text-green-700">{availabilityStats.percentage}%</p>
              </div>
              <ClockIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Tournament Days</p>
                <p className="text-2xl font-bold text-yellow-700">{tournamentDays.length}</p>
              </div>
              <CalendarDaysIcon className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Conflicts</p>
                <p className="text-2xl font-bold text-red-700">{conflicts.length}</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-red-400" />
            </div>
          </div>
        </div>

        {/* Conflicts */}
        {conflicts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Availability Issues</h3>
            <div className="space-y-2">
              {conflicts.map((conflict, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  conflict.severity === 'critical' 
                    ? 'bg-red-50 border-red-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className={`h-4 w-4 mr-2 ${
                      conflict.severity === 'critical' ? 'text-red-400' : 'text-yellow-400'
                    }`} />
                    <span className={`text-sm ${
                      conflict.severity === 'critical' ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {conflict.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
            />
          </div>
          
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="all">All Players</option>
            <option value="morning">Available Mornings</option>
            <option value="daytime">Available Daytime</option>
            <option value="evening">Available Evenings</option>
          </select>

          <div className="text-sm text-gray-500">
            {filteredPlayers.length} of {state.players.length} players
          </div>
        </div>
      </div>

      {/* Bulk Update Panel */}
      {showBulkUpdate && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Bulk Update Availability</h3>
          <div className="grid grid-cols-3 gap-4">
            {periods.map(period => (
              <div key={period.id} className="text-center">
                <h4 className="font-medium text-gray-900 mb-2">{period.name}</h4>
                <p className="text-sm text-gray-500 mb-3">{period.time}</p>
                <div className="space-x-2">
                  <button
                    onClick={() => handleBulkUpdate(period.id as any, true)}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                  >
                    Set Available
                  </button>
                  <button
                    onClick={() => handleBulkUpdate(period.id as any, false)}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                  >
                    Set Unavailable
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Players List */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Player Availability Matrix</h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            {periods.map(period => (
              <div key={period.id} className="flex items-center">
                <div className={`w-3 h-3 rounded mr-2 ${period.color.split(' ')[0]}`} />
                <span>{period.name}</span>
              </div>
            ))}
          </div>
        </div>

        {filteredPlayers.length === 0 ? (
          <div className="text-center py-12">
            <UserIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery ? 'No players match your search criteria.' : 'No players found.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPlayers.map(renderPlayerAvailabilityRow)}
          </div>
        )}
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About Player Availability</h3>
            <div className="mt-1 text-sm text-blue-700 space-y-1">
              <p>• Morning: Matches scheduled up to 11:00 AM</p>
              <p>• Daytime: Matches scheduled between 11:00 AM and 5:00 PM</p>
              <p>• Evening: Matches scheduled after 5:00 PM</p>
              <p>• Players can be available for multiple periods per day</p>
              <p>• The schedule generator will respect these preferences when possible</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}