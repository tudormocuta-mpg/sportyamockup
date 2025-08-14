import { useState } from 'react'
import {
  Cog6ToothIcon,
  ClockIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  BoltIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'
import { useTournament } from '@/contexts/TournamentContext'
import { Court } from '@/types/tournament'

type ConfigTab = 'general' | 'courts' | 'rules' | 'draws'

export default function Configuration() {
  const { state, updateConfig, addCourt, removeCourt, updateCourt } = useTournament()
  const [activeTab, setActiveTab] = useState<ConfigTab>('general')
  const [hasChanges, setHasChanges] = useState(false)
  const [showAddCourtModal, setShowAddCourtModal] = useState(false)
  const [editingCourt, setEditingCourt] = useState<Court | null>(null)

  // Local state for configuration changes
  const [configData, setConfigData] = useState({
    ...state.config,
    tournamentName: state.name,
    startDate: state.startDate,
    endDate: state.endDate,
  })

  const [newCourt, setNewCourt] = useState({
    name: '',
    surface: 'hard' as const,
    indoor: false,
    lighting: true,
    isFinalsCourt: false,
  })

  const handleSaveConfig = () => {
    updateConfig(configData)
    setHasChanges(false)
  }

  const handleConfigChange = (field: string, value: any) => {
    setConfigData({ ...configData, [field]: value })
    setHasChanges(true)
  }

  const handleAddCourt = () => {
    const court: Court = {
      id: `court-${Date.now()}`,
      name: newCourt.name,
      surface: newCourt.surface as any,
      indoor: newCourt.indoor,
      lighting: newCourt.lighting,
      isFinalsCourt: newCourt.isFinalsCourt,
      availability: [
        {
          date: state.startDate,
          startTime: '08:00',
          endTime: '22:00',
        },
      ],
    }
    addCourt(court)
    setShowAddCourtModal(false)
    setNewCourt({
      name: '',
      surface: 'hard',
      indoor: false,
      lighting: true,
      isFinalsCourt: false,
    })
  }

  const handleDeleteCourt = (courtId: string) => {
    if (confirm('Are you sure you want to delete this court?')) {
      removeCourt(courtId)
    }
  }

  const tabs = [
    { id: 'general', name: 'General Settings', icon: Cog6ToothIcon },
    { id: 'courts', name: 'Court Management', icon: BuildingOfficeIcon },
    { id: 'rules', name: 'Scheduling Rules', icon: ClockIcon },
    { id: 'draws', name: 'Draw Settings', icon: UserGroupIcon },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament Name
                  </label>
                  <input
                    type="text"
                    value={configData.tournamentName}
                    onChange={(e) => handleConfigChange('tournamentName', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament Format
                  </label>
                  <select className="w-full border border-gray-300 rounded-md px-3 py-2">
                    <option>Single Elimination</option>
                    <option>Round Robin</option>
                    <option>Group Stage + Knockout</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={configData.startDate}
                    onChange={(e) => handleConfigChange('startDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={configData.endDate}
                    onChange={(e) => handleConfigChange('endDate', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Time Settings</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Match Duration
                  </label>
                  <select
                    value={configData.defaultMatchDuration}
                    onChange={(e) => handleConfigChange('defaultMatchDuration', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                    <option value="150">150 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buffer Between Matches
                  </label>
                  <select
                    value={configData.bufferTimeBetweenMatches}
                    onChange={(e) => handleConfigChange('bufferTimeBetweenMatches', parseInt(e.target.value))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="0">No buffer</option>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily Start Time
                  </label>
                  <input
                    type="time"
                    value={configData.dailyStartTime}
                    onChange={(e) => handleConfigChange('dailyStartTime', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daily End Time
                  </label>
                  <input
                    type="time"
                    value={configData.dailyEndTime}
                    onChange={(e) => handleConfigChange('dailyEndTime', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    These settings will be used as defaults when generating new schedules. You can override them during schedule generation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'courts':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Court Management</h3>
              <button
                onClick={() => setShowAddCourtModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Court
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {state.courts.map((court) => (
                <div key={court.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-lg font-semibold text-gray-900">{court.name}</h4>
                        {court.isFinalsCourt && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            Finals Court
                          </span>
                        )}
                      </div>
                      <div className="mt-2 grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Surface:</span>
                          <span className="ml-2 font-medium capitalize">{court.surface}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 font-medium">{court.indoor ? 'Indoor' : 'Outdoor'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Lighting:</span>
                          <span className="ml-2 font-medium">{court.lighting ? 'Yes' : 'No'}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Availability:</span>
                          <span className="ml-2 font-medium text-green-600">Available</span>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center space-x-4 text-sm">
                        <button className="text-blue-600 hover:text-blue-800">
                          <CalendarIcon className="h-4 w-4 inline mr-1" />
                          Manage Availability
                        </button>
                        <button
                          onClick={() => setEditingCourt(court)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          <PencilIcon className="h-4 w-4 inline mr-1" />
                          Edit
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteCourt(court.id)}
                      className="ml-4 text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {state.courts.length === 0 && (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No courts configured yet.</p>
                <button
                  onClick={() => setShowAddCourtModal(true)}
                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                >
                  Add your first court
                </button>
              </div>
            )}
          </div>
        )

      case 'rules':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Scheduling Rules</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rest Period Between Matches
                </label>
                <select
                  value={configData.minimumRestPeriod}
                  onChange={(e) => handleConfigChange('minimumRestPeriod', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                  <option value="180">180 minutes</option>
                  <option value="240">240 minutes</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Players must have at least this much rest between consecutive matches
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Matches Per Player Per Day
                </label>
                <select
                  value={configData.maxMatchesPerPlayerPerDay}
                  onChange={(e) => handleConfigChange('maxMatchesPerPlayerPerDay', parseInt(e.target.value))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="1">1 match</option>
                  <option value="2">2 matches</option>
                  <option value="3">3 matches</option>
                  <option value="4">4 matches</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indoor Court Utilization
                </label>
                <select
                  value={configData.indoorCourtUtilization}
                  onChange={(e) => handleConfigChange('indoorCourtUtilization', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="always">Always use indoor courts</option>
                  <option value="weather-dependent">Use based on weather conditions</option>
                  <option value="finals-only">Reserve for finals only</option>
                  <option value="never">Outdoor courts only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Constraint Priority Order
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  When conflicts arise, the system will prioritize resolving them in this order:
                </p>
                <div className="space-y-2">
                  {configData.constraintPriority.map((constraint, index) => (
                    <div key={constraint} className="flex items-center bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                      <span className="text-gray-400 font-medium mr-3">#{index + 1}</span>
                      <span className="capitalize">{constraint.replace('-', ' ')}</span>
                      <div className="ml-auto flex space-x-2">
                        <button
                          onClick={() => {
                            const newPriority = [...configData.constraintPriority]
                            if (index > 0) {
                              [newPriority[index], newPriority[index - 1]] = [newPriority[index - 1], newPriority[index]]
                              handleConfigChange('constraintPriority', newPriority)
                            }
                          }}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => {
                            const newPriority = [...configData.constraintPriority]
                            if (index < newPriority.length - 1) {
                              [newPriority[index], newPriority[index + 1]] = [newPriority[index + 1], newPriority[index]]
                              handleConfigChange('constraintPriority', newPriority)
                            }
                          }}
                          disabled={index === configData.constraintPriority.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-3"
                    defaultChecked
                  />
                  <div>
                    <span className="font-medium">Auto-detect schedule conflicts</span>
                    <p className="text-sm text-gray-500">
                      Automatically scan for and report scheduling conflicts after any changes
                    </p>
                  </div>
                </label>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-3"
                    defaultChecked
                  />
                  <div>
                    <span className="font-medium">Enforce rest periods</span>
                    <p className="text-sm text-gray-500">
                      Prevent scheduling matches that violate minimum rest requirements
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )

      case 'draws':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Draw Settings</h3>
            
            <div className="space-y-4">
              {state.draws.map((draw) => (
                <div key={draw.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{draw.name}</h4>
                      <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Format:</span>
                          <span className="ml-2 font-medium capitalize">{draw.format}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Type:</span>
                          <span className="ml-2 font-medium capitalize">{draw.type.replace('+', ' + ')}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Players:</span>
                          <span className="ml-2 font-medium">{draw.numberOfPlayers}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <p className="text-sm text-gray-600">
                          Preferred Courts: {draw.preferences?.preferredCourts?.map(courtId => 
                            state.courts.find(c => c.id === courtId)?.name
                          ).join(', ') || 'Any'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Max matches per day: {draw.preferences?.maxMatchesPerDay || 'Unlimited'}
                        </p>
                      </div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <InformationCircleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Draw configurations are imported from SportyaOS. To modify draw structure, please use the main draw management interface.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage tournament settings, courts, and scheduling rules
            </p>
          </div>
          {hasChanges && (
            <button
              onClick={handleSaveConfig}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <CheckIcon className="h-5 w-5 mr-2" />
              Save Changes
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ConfigTab)}
                  className={`flex items-center px-1 py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {renderTabContent()}
      </div>

      {/* Add Court Modal */}
      {showAddCourtModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowAddCourtModal(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Court</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Court Name
                  </label>
                  <input
                    type="text"
                    value={newCourt.name}
                    onChange={(e) => setNewCourt({ ...newCourt, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="e.g., Center Court"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Surface Type
                  </label>
                  <select
                    value={newCourt.surface}
                    onChange={(e) => setNewCourt({ ...newCourt, surface: e.target.value as any })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="hard">Hard</option>
                    <option value="clay">Clay</option>
                    <option value="grass">Grass</option>
                    <option value="indoor">Indoor</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newCourt.indoor}
                      onChange={(e) => setNewCourt({ ...newCourt, indoor: e.target.checked })}
                      className="mr-3"
                    />
                    <span>Indoor Court</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newCourt.lighting}
                      onChange={(e) => setNewCourt({ ...newCourt, lighting: e.target.checked })}
                      className="mr-3"
                    />
                    <span>Has Lighting</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newCourt.isFinalsCourt}
                      onChange={(e) => setNewCourt({ ...newCourt, isFinalsCourt: e.target.checked })}
                      className="mr-3"
                    />
                    <span>Preferred for Finals</span>
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowAddCourtModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCourt}
                  disabled={!newCourt.name}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Court
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}