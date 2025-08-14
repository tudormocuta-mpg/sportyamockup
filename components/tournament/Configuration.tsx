import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import ScheduleGenerationWizard from './ScheduleGenerationWizard'

interface TournamentConfig {
  matchDuration: number
  bufferTime: number
  minRestPeriod: number
  startTime: string
  endTime: string
  finalsCourt: string
  indoorCourtPriority: boolean
  maxMatchesPerPlayerPerDay: number
}

const Configuration: React.FC = () => {
  const { state } = useTournament()
  const [activeTab, setActiveTab] = useState<'settings' | 'wizard'>('settings')
  const [config, setConfig] = useState<TournamentConfig>({
    matchDuration: 90,
    bufferTime: 15,
    minRestPeriod: 90,
    startTime: '09:00',
    endTime: '18:00',
    finalsCourt: 'c1',
    indoorCourtPriority: false,
    maxMatchesPerPlayerPerDay: 3
  })

  const [courtAvailability, setCourtAvailability] = useState(
    state.courts.map(court => ({
      courtId: court.id,
      name: court.name,
      startTime: '08:00',
      endTime: '20:00',
      maintenanceBlocks: [
        { startTime: '12:00', endTime: '13:00', description: 'Lunch break' }
      ],
      available: true
    }))
  )

  const [schedulingRules, setSchedulingRules] = useState([
    { id: 'court-availability', name: 'Court Availability', priority: 1, enabled: true },
    { id: 'player-rest', name: 'Player Rest Time', priority: 2, enabled: true },
    { id: 'finals-court', name: 'Finals Court Preference', priority: 3, enabled: true },
    { id: 'indoor-priority', name: 'Indoor Court Priority', priority: 4, enabled: false },
    { id: 'player-availability', name: 'Player Availability', priority: 5, enabled: true }
  ])

  const handleConfigChange = (field: keyof TournamentConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveConfig = () => {
    // Simulate saving configuration
    setTimeout(() => {
      alert('Configuration saved successfully!')
    }, 500)
  }

  const addMaintenanceBlock = (courtIndex: number) => {
    setCourtAvailability(prev => 
      prev.map((court, index) => 
        index === courtIndex 
          ? {
              ...court,
              maintenanceBlocks: [
                ...court.maintenanceBlocks,
                { startTime: '16:00', endTime: '17:00', description: 'New maintenance block' }
              ]
            }
          : court
      )
    )
  }

  const removeMaintenanceBlock = (courtIndex: number, blockIndex: number) => {
    setCourtAvailability(prev => 
      prev.map((court, index) => 
        index === courtIndex 
          ? {
              ...court,
              maintenanceBlocks: court.maintenanceBlocks.filter((_, bIndex) => bIndex !== blockIndex)
            }
          : court
      )
    )
  }

  const moveRule = (fromIndex: number, toIndex: number) => {
    const newRules = [...schedulingRules]
    const [movedRule] = newRules.splice(fromIndex, 1)
    newRules.splice(toIndex, 0, movedRule)
    
    // Update priority numbers
    const updatedRules = newRules.map((rule, index) => ({
      ...rule,
      priority: index + 1
    }))
    
    setSchedulingRules(updatedRules)
  }

  return (
    <div className="configuration-container h-full overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Tournament Configuration</h2>
              <p className="text-gray-600 mt-2">Configure scheduling rules and generate tournament schedules</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setActiveTab('wizard')}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Schedule Wizard
              </button>
              <button
                onClick={handleSaveConfig}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Save Configuration
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'settings', name: 'Configuration Settings' },
                { id: 'wizard', name: 'Schedule Generation Wizard' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'wizard' ? (
          <ScheduleGenerationWizard />
        ) : (
          <div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Match Scheduling Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Scheduling</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Match Duration (minutes)
                </label>
                <select
                  value={config.matchDuration}
                  onChange={(e) => handleConfigChange('matchDuration', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={60}>60 minutes</option>
                  <option value={90}>90 minutes</option>
                  <option value={120}>120 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buffer Time Between Matches (minutes)
                </label>
                <input
                  type="number"
                  value={config.bufferTime}
                  onChange={(e) => handleConfigChange('bufferTime', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="60"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rest Period (minutes)
                </label>
                <input
                  type="number"
                  value={config.minRestPeriod}
                  onChange={(e) => handleConfigChange('minRestPeriod', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="30"
                  max="240"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                  <input
                    type="time"
                    value={config.startTime}
                    onChange={(e) => handleConfigChange('startTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                  <input
                    type="time"
                    value={config.endTime}
                    onChange={(e) => handleConfigChange('endTime', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Matches Per Player Per Day
                </label>
                <input
                  type="number"
                  value={config.maxMatchesPerPlayerPerDay}
                  onChange={(e) => handleConfigChange('maxMatchesPerPlayerPerDay', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="8"
                />
              </div>
            </div>
          </div>

          {/* Court Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Court Management</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Finals Court
                </label>
                <select
                  value={config.finalsCourt}
                  onChange={(e) => handleConfigChange('finalsCourt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {state.courts.map(court => (
                    <option key={court.id} value={court.id}>
                      {court.name} ({court.surface})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="indoorPriority"
                  checked={config.indoorCourtPriority}
                  onChange={(e) => handleConfigChange('indoorCourtPriority', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="indoorPriority" className="ml-2 text-sm text-gray-700">
                  Prioritize indoor courts for important matches
                </label>
              </div>
            </div>

            {/* Court Availability */}
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Daily Court Availability</h4>
              <div className="space-y-3">
                {courtAvailability.map((court, courtIndex) => (
                  <div key={court.courtId} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-gray-800">{court.name}</h5>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={court.available}
                          onChange={(e) => {
                            const newAvailability = [...courtAvailability]
                            newAvailability[courtIndex].available = e.target.checked
                            setCourtAvailability(newAvailability)
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">Available</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="time"
                        value={court.startTime}
                        onChange={(e) => {
                          const newAvailability = [...courtAvailability]
                          newAvailability[courtIndex].startTime = e.target.value
                          setCourtAvailability(newAvailability)
                        }}
                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      <input
                        type="time"
                        value={court.endTime}
                        onChange={(e) => {
                          const newAvailability = [...courtAvailability]
                          newAvailability[courtIndex].endTime = e.target.value
                          setCourtAvailability(newAvailability)
                        }}
                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    {/* Maintenance Blocks */}
                    <div className="text-xs text-gray-600 mb-1">Maintenance Blocks:</div>
                    {court.maintenanceBlocks.map((block, blockIndex) => (
                      <div key={blockIndex} className="flex items-center space-x-2 text-xs mb-1">
                        <input
                          type="time"
                          value={block.startTime}
                          className="px-1 py-1 border border-gray-300 rounded w-16"
                          disabled
                        />
                        <span>-</span>
                        <input
                          type="time"
                          value={block.endTime}
                          className="px-1 py-1 border border-gray-300 rounded w-16"
                          disabled
                        />
                        <input
                          type="text"
                          value={block.description}
                          className="flex-1 px-1 py-1 border border-gray-300 rounded"
                          disabled
                        />
                        <button
                          onClick={() => removeMaintenanceBlock(courtIndex, blockIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addMaintenanceBlock(courtIndex)}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      + Add Maintenance Block
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Advanced Scheduling Rules */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Scheduling Rules Priority</h3>
            <p className="text-sm text-gray-600 mb-4">
              Drag to reorder rule priority. Higher priority rules are applied first.
            </p>
            
            <div className="space-y-2">
              {schedulingRules.map((rule, index) => (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      {rule.priority}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{rule.name}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={rule.enabled}
                      onChange={(e) => {
                        const newRules = [...schedulingRules]
                        newRules[index].enabled = e.target.checked
                        setSchedulingRules(newRules)
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex flex-col">
                      <button
                        onClick={() => index > 0 && moveRule(index, index - 1)}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        disabled={index === 0}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => index < schedulingRules.length - 1 && moveRule(index, index + 1)}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                        disabled={index === schedulingRules.length - 1}
                      >
                        ▼
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Rule Descriptions:</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <div><strong>Court Availability:</strong> Ensure courts are available during scheduled times</div>
                <div><strong>Player Rest Time:</strong> Maintain minimum rest period between matches</div>
                <div><strong>Finals Court Preference:</strong> Use designated court for final matches</div>
                <div><strong>Indoor Court Priority:</strong> Prefer indoor courts for important matches</div>
                <div><strong>Player Availability:</strong> Match player availability preferences</div>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration Summary</h3>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Match Settings</h4>
              <div className="space-y-1 text-gray-600">
                <div>Duration: {config.matchDuration} minutes</div>
                <div>Buffer: {config.bufferTime} minutes</div>
                <div>Rest: {config.minRestPeriod} minutes</div>
                <div>Hours: {config.startTime} - {config.endTime}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Court Settings</h4>
              <div className="space-y-1 text-gray-600">
                <div>Finals Court: {state.courts.find(c => c.id === config.finalsCourt)?.name}</div>
                <div>Indoor Priority: {config.indoorCourtPriority ? 'Yes' : 'No'}</div>
                <div>Available Courts: {courtAvailability.filter(c => c.available).length}</div>
                <div>Max Matches/Player: {config.maxMatchesPerPlayerPerDay}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Active Rules</h4>
              <div className="space-y-1 text-gray-600">
                {schedulingRules.filter(r => r.enabled).slice(0, 4).map(rule => (
                  <div key={rule.id}>#{rule.priority} {rule.name}</div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Configuration