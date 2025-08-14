import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { 
  XMarkIcon, 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon,
  TrophyIcon,
  UserIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { Match } from '@/types/tournament'

interface MatchDetailsCardProps {
  isOpen: boolean
  onClose: () => void
  match: Match | null
}

// Mock extended match data
const getExtendedMatchData = (match: Match) => ({
  ...match,
  tournament: "Summer Championship 2024",
  referee: "John Matthews",
  ballPerson: "Sarah Wilson",
  estimatedDuration: "1h 30m",
  broadcastInfo: {
    isLive: match.status === 'in-progress',
    streamUrl: match.courtName === 'Center Court' ? 'https://stream.sportya.net/center' : null,
    cameras: match.courtName === 'Center Court' ? 3 : 1
  },
  weather: {
    temperature: "75°F",
    humidity: "65%",
    wind: "5 mph NE",
    conditions: "Partly Cloudy"
  },
  history: {
    headToHead: {
      player1Wins: 2,
      player2Wins: 1,
      lastMatch: "2023-08-15",
      lastResult: `${match.player1Name} won 6-4, 7-5`
    }
  },
  analytics: {
    predictedWinner: match.player1Name,
    confidence: 67,
    keyStats: {
      avgFirstServe: { player1: 68, player2: 72 },
      avgAces: { player1: 8, player2: 6 },
      recentForm: { player1: "W-W-L-W-W", player2: "W-L-W-W-L" }
    }
  },
  scheduling: {
    conflicts: [],
    courtAvailability: "Available until 18:00",
    equipmentChecked: true,
    warmupTime: "10 minutes"
  },
  notifications: match.status === 'scheduled' ? [
    {
      type: 'info',
      message: 'Match scheduled 15 minutes earlier than requested due to court availability'
    }
  ] : match.status === 'in-progress' ? [
    {
      type: 'warning', 
      message: 'Match running 20 minutes behind schedule'
    }
  ] : []
})

export default function MatchDetailsCard({ isOpen, onClose, match }: MatchDetailsCardProps) {
  if (!match) return null

  const extendedMatch = getExtendedMatchData(match)
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

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
                    <div className="bg-indigo-600 px-6 py-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusColor(match.status)}`}>
                              {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                            </span>
                            {extendedMatch.broadcastInfo.isLive && (
                              <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded-full animate-pulse">
                                LIVE
                              </span>
                            )}
                          </div>
                          <Dialog.Title className="text-2xl font-bold text-white">
                            {match.drawName} - {match.round}
                          </Dialog.Title>
                          <div className="mt-1 text-indigo-100">
                            Match #{match.id} • {extendedMatch.tournament}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="rounded-md bg-indigo-600 text-indigo-200 hover:text-white"
                          onClick={onClose}
                        >
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                      </div>
                    </div>

                    {/* Notifications */}
                    {extendedMatch.notifications.length > 0 && (
                      <div className="px-6 py-3 bg-orange-50 border-b border-orange-200">
                        {extendedMatch.notifications.map((notification, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
                            <span className="text-sm text-orange-700">{notification.message}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Content */}
                    <div className="relative flex-1 px-6 py-6">
                      {/* Players & Score */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Details</h3>
                        <div className="bg-gray-50 rounded-lg p-6">
                          <div className="flex items-center justify-between">
                            <div className="text-center flex-1">
                              <div className="text-xl font-bold text-gray-900">{match.player1Name}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                Form: {extendedMatch.analytics.keyStats.recentForm.player1}
                              </div>
                            </div>
                            <div className="px-8">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-gray-900">
                                  {match.score || 'vs'}
                                </div>
                                {match.status === 'in-progress' && (
                                  <div className="text-sm text-blue-600 font-medium">In Progress</div>
                                )}
                              </div>
                            </div>
                            <div className="text-center flex-1">
                              <div className="text-xl font-bold text-gray-900">{match.player2Name}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                Form: {extendedMatch.analytics.keyStats.recentForm.player2}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Match Information */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Information</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex items-center space-x-3">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">Date</div>
                              <div className="font-medium">Today</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <ClockIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">Time</div>
                              <div className="font-medium">{match.scheduledTime || 'TBD'}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">Court</div>
                              <div className="font-medium">{match.courtName}</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="text-sm text-gray-500">Referee</div>
                              <div className="font-medium">{extendedMatch.referee}</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Head-to-Head */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Head-to-Head History</h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between items-center mb-3">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-green-600">
                                {extendedMatch.history.headToHead.player1Wins}
                              </div>
                              <div className="text-sm text-gray-500">{match.player1Name}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xl font-bold text-gray-400">-</div>
                              <div className="text-sm text-gray-500">Wins</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {extendedMatch.history.headToHead.player2Wins}
                              </div>
                              <div className="text-sm text-gray-500">{match.player2Name}</div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 text-center">
                            Last meeting: {extendedMatch.history.headToHead.lastMatch} - {extendedMatch.history.headToHead.lastResult}
                          </div>
                        </div>
                      </div>

                      {/* Analytics */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <ChartBarIcon className="h-5 w-5 mr-2" />
                          Match Analytics
                        </h3>
                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-500 mb-2">Predicted Winner</div>
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{extendedMatch.analytics.predictedWinner}</span>
                              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                {extendedMatch.analytics.confidence}% confidence
                              </span>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-sm text-gray-500">First Serve %</div>
                              <div className="text-lg font-semibold">
                                {extendedMatch.analytics.keyStats.avgFirstServe.player1}% vs {extendedMatch.analytics.keyStats.avgFirstServe.player2}%
                              </div>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <div className="text-sm text-gray-500">Average Aces</div>
                              <div className="text-lg font-semibold">
                                {extendedMatch.analytics.keyStats.avgAces.player1} vs {extendedMatch.analytics.keyStats.avgAces.player2}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Broadcast & Weather */}
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Information</h3>
                        <div className="space-y-4">
                          {extendedMatch.broadcastInfo.streamUrl && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium text-blue-900">Live Stream Available</div>
                                  <div className="text-sm text-blue-700">{extendedMatch.broadcastInfo.cameras} camera angles</div>
                                </div>
                                <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                                  Watch Live
                                </button>
                              </div>
                            </div>
                          )}
                          <div className="bg-gray-50 rounded-lg p-4">
                            <div className="font-medium text-gray-900 mb-2">Weather Conditions</div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Temperature:</span>
                                <span className="ml-2">{extendedMatch.weather.temperature}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Conditions:</span>
                                <span className="ml-2">{extendedMatch.weather.conditions}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Humidity:</span>
                                <span className="ml-2">{extendedMatch.weather.humidity}</span>
                              </div>
                              <div>
                                <span className="text-gray-500">Wind:</span>
                                <span className="ml-2">{extendedMatch.weather.wind}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                      <div className="flex justify-between">
                        <div className="space-x-3">
                          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Edit Match
                          </button>
                          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                            Reschedule
                          </button>
                        </div>
                        <div className="space-x-3">
                          {match.status === 'scheduled' && (
                            <button className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700">
                              Start Match
                            </button>
                          )}
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