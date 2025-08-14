import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CalendarIcon, TrophyIcon, ChartBarIcon, ClockIcon } from '@heroicons/react/24/outline'

interface PlayerData {
  name: string
  photo?: string
  ranking: number
  nationality: string
  age: number
  height: string
  weight: string
  plays: string
  backhand: string
  tournamentActivity: {
    totalMatches: number
    wins: number
    losses: number
    upcomingMatches: Array<{
      id: string
      opponent: string
      date: string
      time: string
      court: string
      round: string
    }>
    recentMatches: Array<{
      id: string
      opponent: string
      result: string
      score: string
      date: string
    }>
  }
  performance: {
    firstServePercentage: number
    acesPerMatch: number
    breakPointsSaved: number
    averageMatchDuration: string
  }
  availability: {
    blockedSlots: Array<{
      date: string
      startTime: string
      endTime: string
      reason: string
    }>
    preferences: {
      preferredTimes: string[]
      courtPreferences: string[]
      restMinimum: string
    }
  }
}

interface PlayerMatchCardProps {
  isOpen: boolean
  onClose: () => void
  playerName: string
}

// Mock player data
const mockPlayerData: PlayerData = {
  name: "John Smith",
  ranking: 15,
  nationality: "USA",
  age: 24,
  height: "6'2\"",
  weight: "185 lbs",
  plays: "Right-handed",
  backhand: "Two-handed",
  tournamentActivity: {
    totalMatches: 12,
    wins: 9,
    losses: 3,
    upcomingMatches: [
      {
        id: "5",
        opponent: "David Brown",
        date: "2024-07-15",
        time: "15:00",
        court: "Center Court",
        round: "Quarterfinals"
      },
      {
        id: "8",
        opponent: "TBD",
        date: "2024-07-16",
        time: "14:00",
        court: "Center Court",
        round: "Semifinals"
      }
    ],
    recentMatches: [
      {
        id: "1",
        opponent: "Mike Wilson",
        result: "Won",
        score: "6-4, 6-2",
        date: "2024-07-14"
      },
      {
        id: "2",
        opponent: "Tom Anderson",
        result: "Won",
        score: "7-5, 6-3",
        date: "2024-07-13"
      },
      {
        id: "3",
        opponent: "James Lee",
        result: "Won",
        score: "6-2, 6-4",
        date: "2024-07-12"
      }
    ]
  },
  performance: {
    firstServePercentage: 68.5,
    acesPerMatch: 8.3,
    breakPointsSaved: 72.4,
    averageMatchDuration: "1h 45m"
  },
  availability: {
    blockedSlots: [
      {
        date: "2024-07-15",
        startTime: "08:00",
        endTime: "10:00",
        reason: "Media obligations"
      },
      {
        date: "2024-07-16",
        startTime: "18:00",
        endTime: "20:00",
        reason: "Sponsor event"
      }
    ],
    preferences: {
      preferredTimes: ["Afternoon (12:00-17:00)", "Early Evening (17:00-19:00)"],
      courtPreferences: ["Center Court", "Court 1"],
      restMinimum: "4 hours between matches"
    }
  }
}

export default function PlayerMatchCard({ isOpen, onClose, playerName }: PlayerMatchCardProps) {
  // In a real app, fetch player data based on playerName
  const playerData = { ...mockPlayerData, name: playerName }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-2xl">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="bg-blue-600 px-6 py-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold text-2xl">
                            {playerData.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <Dialog.Title className="text-2xl font-bold text-white">
                              {playerData.name}
                            </Dialog.Title>
                            <div className="mt-1 text-blue-100">
                              Rank #{playerData.ranking} • {playerData.nationality} • Age {playerData.age}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="rounded-md bg-blue-600 text-blue-200 hover:text-white"
                          onClick={onClose}
                        >
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="relative flex-1 px-6 py-6">
                      {/* Profile Information */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Profile</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Height:</span>
                            <span className="ml-2 text-gray-900">{playerData.height}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Weight:</span>
                            <span className="ml-2 text-gray-900">{playerData.weight}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Plays:</span>
                            <span className="ml-2 text-gray-900">{playerData.plays}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Backhand:</span>
                            <span className="ml-2 text-gray-900">{playerData.backhand}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tournament Activity */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <TrophyIcon className="h-5 w-5 mr-2" />
                          Tournament Activity
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                              <div className="text-2xl font-bold text-gray-900">{playerData.tournamentActivity.totalMatches}</div>
                              <div className="text-sm text-gray-500">Total Matches</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-green-600">{playerData.tournamentActivity.wins}</div>
                              <div className="text-sm text-gray-500">Wins</div>
                            </div>
                            <div>
                              <div className="text-2xl font-bold text-red-600">{playerData.tournamentActivity.losses}</div>
                              <div className="text-sm text-gray-500">Losses</div>
                            </div>
                          </div>
                        </div>

                        {/* Upcoming Matches */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Upcoming Matches</h4>
                          <div className="space-y-2">
                            {playerData.tournamentActivity.upcomingMatches.map((match) => (
                              <div key={match.id} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <div className="font-medium text-gray-900">vs {match.opponent}</div>
                                    <div className="text-sm text-gray-500">{match.round}</div>
                                  </div>
                                  <div className="text-right text-sm">
                                    <div className="text-gray-900">{match.date}</div>
                                    <div className="text-gray-500">{match.time} • {match.court}</div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Recent Results */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Recent Results</h4>
                          <div className="space-y-2">
                            {playerData.tournamentActivity.recentMatches.map((match) => (
                              <div key={match.id} className="flex justify-between items-center py-2 border-b border-gray-100">
                                <div className="flex items-center">
                                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                                    match.result === 'Won' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {match.result}
                                  </span>
                                  <span className="ml-3 text-sm text-gray-900">vs {match.opponent}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                  {match.score} • {match.date}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Performance Stats */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <ChartBarIcon className="h-5 w-5 mr-2" />
                          Performance Stats
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-500">First Serve %</div>
                            <div className="text-xl font-semibold text-gray-900">{playerData.performance.firstServePercentage}%</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-500">Aces per Match</div>
                            <div className="text-xl font-semibold text-gray-900">{playerData.performance.acesPerMatch}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-500">Break Points Saved</div>
                            <div className="text-xl font-semibold text-gray-900">{playerData.performance.breakPointsSaved}%</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-sm text-gray-500">Avg Match Duration</div>
                            <div className="text-xl font-semibold text-gray-900">{playerData.performance.averageMatchDuration}</div>
                          </div>
                        </div>
                      </div>

                      {/* Scheduling Constraints */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <ClockIcon className="h-5 w-5 mr-2" />
                          Scheduling Constraints
                        </h3>
                        
                        {/* Blocked Slots */}
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Blocked Time Slots</h4>
                          <div className="space-y-2">
                            {playerData.availability.blockedSlots.map((slot, index) => (
                              <div key={index} className="flex justify-between items-center bg-red-50 border border-red-200 rounded-lg p-3">
                                <div>
                                  <div className="text-sm font-medium text-red-900">{slot.date}</div>
                                  <div className="text-sm text-red-700">{slot.startTime} - {slot.endTime}</div>
                                </div>
                                <div className="text-sm text-red-600">{slot.reason}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Preferences */}
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Preferences</h4>
                          <div className="space-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Preferred Times:</span>
                              <span className="ml-2 text-gray-900">{playerData.availability.preferences.preferredTimes.join(', ')}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Court Preference:</span>
                              <span className="ml-2 text-gray-900">{playerData.availability.preferences.courtPreferences.join(', ')}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Rest Requirements:</span>
                              <span className="ml-2 text-gray-900">{playerData.availability.preferences.restMinimum}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex justify-between">
                        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                          View Full Profile
                        </button>
                        <div className="space-x-3">
                          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
                            Schedule Match
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50" onClick={onClose}>
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}