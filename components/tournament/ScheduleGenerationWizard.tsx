import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'

interface ScheduleOption {
  id: string
  name: string
  description: string
  duration: string
  tradeoffs: string[]
  qualityScore: number
  details: {
    totalDays: number
    matchesPerDay: number
    courtUtilization: number
    playerRestTime: number
  }
}

interface WizardStep {
  id: string
  title: string
  description: string
  completed: boolean
}

const ScheduleGenerationWizard: React.FC = () => {
  const { state } = useTournament()
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedOptions, setGeneratedOptions] = useState<ScheduleOption[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  
  const [wizardData, setWizardData] = useState({
    priority: 'balanced',
    constraints: {
      maxDaysPerPlayer: 3,
      preferredStartTime: '09:00',
      preferredEndTime: '17:00',
      courtPreferences: [] as string[],
      restTimeImportance: 'high'
    },
    preferences: {
      compactSchedule: false,
      indoorCourtPriority: false,
      finalsDayFocus: true,
      playerAvailabilityWeight: 'medium'
    }
  })

  const steps: WizardStep[] = [
    {
      id: 'setup',
      title: 'Tournament Setup',
      description: 'Configure basic tournament parameters',
      completed: false
    },
    {
      id: 'constraints',
      title: 'Scheduling Constraints',
      description: 'Set time limits and court preferences',
      completed: false
    },
    {
      id: 'preferences',
      title: 'Optimization Preferences',
      description: 'Choose what to optimize for',
      completed: false
    },
    {
      id: 'generate',
      title: 'Generate Options',
      description: 'Create schedule alternatives',
      completed: false
    },
    {
      id: 'review',
      title: 'Review & Select',
      description: 'Compare and choose the best option',
      completed: false
    }
  ]

  const generateScheduleOptions = async () => {
    setIsGenerating(true)
    
    // Simulate generation process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const mockOptions: ScheduleOption[] = [
      {
        id: 'compact',
        name: 'Compact Schedule',
        description: 'Minimize tournament duration with intensive daily schedules',
        duration: '3 days',
        tradeoffs: ['Higher court utilization', 'Less rest time between matches', 'Earlier start/later finish'],
        qualityScore: 85,
        details: {
          totalDays: 3,
          matchesPerDay: 18,
          courtUtilization: 92,
          playerRestTime: 75
        }
      },
      {
        id: 'relaxed',
        name: 'Relaxed Schedule',
        description: 'Spread matches over more days with better rest periods',
        duration: '4 days',
        tradeoffs: ['Lower court utilization', 'More rest time between matches', 'Standard hours'],
        qualityScore: 92,
        details: {
          totalDays: 4,
          matchesPerDay: 14,
          courtUtilization: 75,
          playerRestTime: 120
        }
      }
    ]
    
    setGeneratedOptions(mockOptions)
    setIsGenerating(false)
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = async () => {
    await generateScheduleOptions()
    nextStep()
  }

  const applySchedule = () => {
    if (selectedOption) {
      alert(`Schedule "${generatedOptions.find(o => o.id === selectedOption)?.name}" has been applied!\n\nNote: This is a mockup - the schedule generation is simulated.`)
    }
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'setup':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Priority</h3>
              <div className="space-y-3">
                {[
                  { id: 'speed', name: 'Speed', desc: 'Minimize tournament duration' },
                  { id: 'quality', name: 'Quality', desc: 'Optimize for best match conditions' },
                  { id: 'balanced', name: 'Balanced', desc: 'Balance duration and quality' }
                ].map(option => (
                  <label key={option.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="priority"
                      value={option.id}
                      checked={wizardData.priority === option.id}
                      onChange={(e) => setWizardData(prev => ({ ...prev, priority: e.target.value }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.name}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Current Tournament Data</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Matches:</span>
                  <span className="ml-2 font-medium">{state.matches.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Available Courts:</span>
                  <span className="ml-2 font-medium">{state.courts.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Active Draws:</span>
                  <span className="ml-2 font-medium">{state.draws.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Players:</span>
                  <span className="ml-2 font-medium">{state.players.length}</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'constraints':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Start Time</label>
                <input
                  type="time"
                  value={wizardData.constraints.preferredStartTime}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    constraints: { ...prev.constraints, preferredStartTime: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred End Time</label>
                <input
                  type="time"
                  value={wizardData.constraints.preferredEndTime}
                  onChange={(e) => setWizardData(prev => ({
                    ...prev,
                    constraints: { ...prev.constraints, preferredEndTime: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Tournament Days per Player</label>
              <select
                value={wizardData.constraints.maxDaysPerPlayer}
                onChange={(e) => setWizardData(prev => ({
                  ...prev,
                  constraints: { ...prev.constraints, maxDaysPerPlayer: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={2}>2 days</option>
                <option value={3}>3 days</option>
                <option value={4}>4 days</option>
                <option value={5}>5 days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rest Time Importance</label>
              <div className="flex space-x-4">
                {['low', 'medium', 'high'].map(level => (
                  <label key={level} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="restTime"
                      value={level}
                      checked={wizardData.constraints.restTimeImportance === level}
                      onChange={(e) => setWizardData(prev => ({
                        ...prev,
                        constraints: { ...prev.constraints, restTimeImportance: e.target.value }
                      }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm capitalize">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Court Preferences (Optional)</label>
              <div className="space-y-2">
                {state.courts.map(court => (
                  <label key={court.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wizardData.constraints.courtPreferences.includes(court.id)}
                      onChange={(e) => {
                        const prefs = wizardData.constraints.courtPreferences
                        setWizardData(prev => ({
                          ...prev,
                          constraints: {
                            ...prev.constraints,
                            courtPreferences: e.target.checked
                              ? [...prefs, court.id]
                              : prefs.filter(id => id !== court.id)
                          }
                        }))
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">{court.name} ({court.surface})</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              {[
                { 
                  key: 'compactSchedule',
                  name: 'Prefer Compact Schedule',
                  desc: 'Try to minimize the total number of tournament days'
                },
                {
                  key: 'indoorCourtPriority',
                  name: 'Indoor Court Priority',
                  desc: 'Prefer indoor courts for important matches when weather is a concern'
                },
                {
                  key: 'finalsDayFocus',
                  name: 'Dedicated Finals Day',
                  desc: 'Reserve the final day primarily for championship matches'
                }
              ].map(pref => (
                <label key={pref.key} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={wizardData.preferences[pref.key as keyof typeof wizardData.preferences] as boolean}
                    onChange={(e) => setWizardData(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, [pref.key]: e.target.checked }
                    }))}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{pref.name}</div>
                    <div className="text-sm text-gray-600">{pref.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Player Availability Weight</label>
              <select
                value={wizardData.preferences.playerAvailabilityWeight}
                onChange={(e) => setWizardData(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, playerAvailabilityWeight: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Low - Schedule efficiency priority</option>
                <option value="medium">Medium - Balance efficiency and availability</option>
                <option value="high">High - Player availability priority</option>
              </select>
            </div>
          </div>
        )

      case 'generate':
        return (
          <div className="text-center py-12">
            {!isGenerating && generatedOptions.length === 0 && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl">⚙️</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Ready to Generate Schedule Options</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  Based on your configuration, we&apos;ll create multiple schedule options with different trade-offs.
                </p>
                <button
                  onClick={handleGenerate}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Generate Schedule Options
                </button>
              </div>
            )}

            {isGenerating && (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Generating Schedule Options</h3>
                <p className="text-gray-600">This may take a few moments...</p>
                <div className="w-64 bg-gray-200 rounded-full h-2 mx-auto">
                  <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                </div>
              </div>
            )}
          </div>
        )

      case 'review':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Choose Your Preferred Schedule</h3>
            
            <div className="grid gap-6">
              {generatedOptions.map(option => (
                <div
                  key={option.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    selectedOption === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOption(option.id)}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="radio"
                          name="scheduleOption"
                          value={option.id}
                          checked={selectedOption === option.id}
                          onChange={() => setSelectedOption(option.id)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <h4 className="text-lg font-semibold text-gray-900">{option.name}</h4>
                      </div>
                      <p className="text-gray-600 ml-6">{option.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{option.qualityScore}</div>
                      <div className="text-sm text-gray-600">Quality Score</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-4 ml-6">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{option.details.totalDays}</div>
                      <div className="text-xs text-gray-600">Days</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{option.details.matchesPerDay}</div>
                      <div className="text-xs text-gray-600">Matches/Day</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{option.details.courtUtilization}%</div>
                      <div className="text-xs text-gray-600">Court Usage</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-gray-900">{option.details.playerRestTime}min</div>
                      <div className="text-xs text-gray-600">Avg Rest</div>
                    </div>
                  </div>

                  <div className="ml-6">
                    <h5 className="font-medium text-gray-900 mb-2">Trade-offs:</h5>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {option.tradeoffs.map((tradeoff, index) => (
                        <li key={index}>• {tradeoff}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {selectedOption && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">✓</span>
                  <span className="font-medium text-green-900">
                    {generatedOptions.find(o => o.id === selectedOption)?.name} selected
                  </span>
                </div>
                <p className="text-green-700 text-sm mt-1">
                  This schedule will be applied to your tournament when you complete the wizard.
                </p>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="wizard-container h-full overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Progress Steps */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-600">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-px mx-4 ${
                    index < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">{steps[currentStep].title}</h2>
            <p className="text-gray-600">{steps[currentStep].description}</p>
          </div>

          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {currentStep === steps.length - 1 ? (
              <button
                onClick={applySchedule}
                disabled={!selectedOption}
                className="px-6 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 transition-colors font-medium"
              >
                Apply Schedule
              </button>
            ) : (
              <button
                onClick={nextStep}
                disabled={currentStep === 3 && generatedOptions.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
              >
                {currentStep === 3 ? 'Review Options' : 'Next'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScheduleGenerationWizard