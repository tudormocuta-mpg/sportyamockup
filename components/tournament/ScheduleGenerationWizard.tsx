import { Fragment, useState, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CogIcon,
  CheckIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'
import { useTournament } from '@/contexts/TournamentContext'

interface ScheduleGenerationWizardProps {
  isOpen: boolean
  onClose: () => void
}

type WizardStep = 'parameters' | 'availability' | 'constraints' | 'generating' | 'comparison' | 'complete'

export default function ScheduleGenerationWizard({ isOpen, onClose }: ScheduleGenerationWizardProps) {
  const { state, generateScheduleOptions, selectScheduleOption, updateConfig } = useTournament()
  const [currentStep, setCurrentStep] = useState<WizardStep>('parameters')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)

  // Wizard form state
  const [wizardData, setWizardData] = useState({
    matchDuration: state.config.defaultMatchDuration,
    bufferTime: state.config.bufferTimeBetweenMatches,
    restPeriod: state.config.minimumRestPeriod,
    startTime: state.config.dailyStartTime,
    endTime: state.config.dailyEndTime,
    maxMatchesPerDay: state.config.maxMatchesPerPlayerPerDay,
    prioritizeFinals: true,
    useIndoorCourts: 'weather-dependent',
    playerAvailability: 'flexible',
    constraintPriority: [...state.config.constraintPriority],
  })

  const steps = [
    { id: 'parameters', name: 'Basic Parameters', icon: CalendarIcon },
    { id: 'availability', name: 'Player Availability', icon: UsersIcon },
    { id: 'constraints', name: 'Advanced Rules', icon: CogIcon },
    { id: 'generating', name: 'Generate', icon: SparklesIcon },
    { id: 'comparison', name: 'Compare Options', icon: CheckIcon },
  ]

  const getStepIndex = (step: WizardStep) => {
    const stepMap: Record<WizardStep, number> = {
      'parameters': 0,
      'availability': 1,
      'constraints': 2,
      'generating': 3,
      'comparison': 4,
      'complete': 5,
    }
    return stepMap[step]
  }

  const handleNext = () => {
    switch (currentStep) {
      case 'parameters':
        setCurrentStep('availability')
        break
      case 'availability':
        setCurrentStep('constraints')
        break
      case 'constraints':
        handleGenerate()
        break
      case 'comparison':
        handleSelectOption()
        break
    }
  }

  const handleBack = () => {
    switch (currentStep) {
      case 'availability':
        setCurrentStep('parameters')
        break
      case 'constraints':
        setCurrentStep('availability')
        break
      case 'comparison':
        setCurrentStep('constraints')
        break
    }
  }

  const handleGenerate = async () => {
    setCurrentStep('generating')
    setIsGenerating(true)
    setGenerationProgress(0)

    // Update configuration with wizard data
    updateConfig({
      defaultMatchDuration: wizardData.matchDuration,
      bufferTimeBetweenMatches: wizardData.bufferTime,
      minimumRestPeriod: wizardData.restPeriod,
      dailyStartTime: wizardData.startTime,
      dailyEndTime: wizardData.endTime,
      maxMatchesPerPlayerPerDay: wizardData.maxMatchesPerDay,
      indoorCourtUtilization: wizardData.useIndoorCourts as any,
      constraintPriority: wizardData.constraintPriority,
    })

    // Simulate progress
    const progressInterval = setInterval(() => {
      setGenerationProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    // Generate schedule options
    await generateScheduleOptions()

    // Complete progress
    setGenerationProgress(100)
    setTimeout(() => {
      setIsGenerating(false)
      setCurrentStep('comparison')
    }, 500)
  }

  const handleSelectOption = () => {
    if (selectedOptionId) {
      selectScheduleOption(selectedOptionId)
      setCurrentStep('complete')
      setTimeout(() => {
        onClose()
      }, 2000)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 'parameters':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Basic Scheduling Parameters</h3>
            
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Match Duration
                </label>
                <select
                  value={wizardData.matchDuration}
                  onChange={(e) => setWizardData({ ...wizardData, matchDuration: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buffer Between Matches
                </label>
                <select
                  value={wizardData.bufferTime}
                  onChange={(e) => setWizardData({ ...wizardData, bufferTime: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="0">No buffer</option>
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Rest Period
                </label>
                <select
                  value={wizardData.restPeriod}
                  onChange={(e) => setWizardData({ ...wizardData, restPeriod: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                  <option value="180">180 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Matches Per Day
                </label>
                <select
                  value={wizardData.maxMatchesPerDay}
                  onChange={(e) => setWizardData({ ...wizardData, maxMatchesPerDay: parseInt(e.target.value) })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="1">1 match</option>
                  <option value="2">2 matches</option>
                  <option value="3">3 matches</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily Start Time
                </label>
                <input
                  type="time"
                  value={wizardData.startTime}
                  onChange={(e) => setWizardData({ ...wizardData, startTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Daily End Time
                </label>
                <input
                  type="time"
                  value={wizardData.endTime}
                  onChange={(e) => setWizardData({ ...wizardData, endTime: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    With current settings, approximately {Math.floor((parseInt(wizardData.endTime.split(':')[0]) - parseInt(wizardData.startTime.split(':')[0])) * 60 / (wizardData.matchDuration + wizardData.bufferTime))} matches can be scheduled per court per day.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'availability':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Player Availability Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability Handling
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="strict"
                      checked={wizardData.playerAvailability === 'strict'}
                      onChange={(e) => setWizardData({ ...wizardData, playerAvailability: e.target.value })}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">Strict</span>
                      <p className="text-sm text-gray-500">Only schedule during players&apos; preferred times</p>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="flexible"
                      checked={wizardData.playerAvailability === 'flexible'}
                      onChange={(e) => setWizardData({ ...wizardData, playerAvailability: e.target.value })}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">Flexible</span>
                      <p className="text-sm text-gray-500">Prefer player times but allow exceptions</p>
                    </div>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="ignore"
                      checked={wizardData.playerAvailability === 'ignore'}
                      onChange={(e) => setWizardData({ ...wizardData, playerAvailability: e.target.value })}
                      className="mr-3"
                    />
                    <div>
                      <span className="font-medium">Ignore</span>
                      <p className="text-sm text-gray-500">Schedule without considering preferences</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Current Availability Summary</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-700">{state.players.length}</div>
                    <div className="text-sm text-green-600">Players with availability</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-700">3</div>
                    <div className="text-sm text-yellow-600">Partial conflicts</div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-700">1</div>
                    <div className="text-sm text-red-600">Major conflicts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'constraints':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Advanced Scheduling Rules</h3>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={wizardData.prioritizeFinals}
                    onChange={(e) => setWizardData({ ...wizardData, prioritizeFinals: e.target.checked })}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-medium">Prioritize Finals Courts</span>
                    <p className="text-sm text-gray-500">Schedule finals and semifinals on Center Court when possible</p>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Indoor Court Usage
                </label>
                <select
                  value={wizardData.useIndoorCourts}
                  onChange={(e) => setWizardData({ ...wizardData, useIndoorCourts: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="always">Always use indoor courts</option>
                  <option value="weather-dependent">Use based on weather</option>
                  <option value="finals-only">Reserve for finals only</option>
                  <option value="never">Outdoor courts only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Constraint Priority Order
                </label>
                <p className="text-sm text-gray-500 mb-3">Drag to reorder which rules are most important</p>
                <div className="space-y-2">
                  {wizardData.constraintPriority.map((constraint, index) => (
                    <div key={constraint} className="bg-white border border-gray-300 rounded-md px-3 py-2 flex items-center">
                      <span className="text-gray-400 mr-3">#{index + 1}</span>
                      <span className="capitalize">{constraint.replace('-', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    The system will attempt to satisfy all constraints, but may need to make trade-offs based on your priority order.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )

      case 'generating':
        return (
          <div className="space-y-6">
            <div className="text-center py-12">
              <SparklesIcon className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Schedule Options</h3>
              <p className="text-sm text-gray-500 mb-8">
                Analyzing {state.matches.length} matches across {state.courts.length} courts...
              </p>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                />
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {generationProgress >= 20 && (
                  <div className="flex items-center justify-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    Validating court availability
                  </div>
                )}
                {generationProgress >= 40 && (
                  <div className="flex items-center justify-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    Checking player constraints
                  </div>
                )}
                {generationProgress >= 60 && (
                  <div className="flex items-center justify-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    Optimizing match distribution
                  </div>
                )}
                {generationProgress >= 80 && (
                  <div className="flex items-center justify-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    Resolving conflicts
                  </div>
                )}
                {generationProgress >= 100 && (
                  <div className="flex items-center justify-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
                    Finalizing schedule options
                  </div>
                )}
              </div>
            </div>
          </div>
        )

      case 'comparison':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Choose Your Schedule Option</h3>
            <p className="text-sm text-gray-500">
              We&apos;ve generated {state.generatedOptions.length} schedule options based on your preferences. Select the one that best fits your tournament needs.
            </p>

            <div className="grid grid-cols-2 gap-6">
              {state.generatedOptions.map((option) => (
                <div
                  key={option.id}
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    selectedOptionId === option.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedOptionId(option.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-gray-900">{option.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                    </div>
                    {selectedOptionId === option.id && (
                      <CheckIcon className="h-6 w-6 text-blue-500 flex-shrink-0" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-medium">{option.duration} days</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Court Utilization</span>
                      <span className="font-medium">{option.courtUtilization}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Player Satisfaction</span>
                      <span className="font-medium">{option.playerSatisfaction}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Quality Score</span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${
                              option.qualityScore >= 80 ? 'bg-green-500' : 
                              option.qualityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${option.qualityScore}%` }}
                          />
                        </div>
                        <span className="font-medium">{option.qualityScore}</span>
                      </div>
                    </div>
                    {option.conflicts > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Conflicts</span>
                        <span className="font-medium text-yellow-600">{option.conflicts} minor</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-2">Trade-offs:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {option.tradeoffs.map((tradeoff, index) => (
                        <li key={index} className="flex items-start">
                          <span className="mr-1">•</span>
                          <span>{tradeoff}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center py-12">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckIcon className="h-10 w-10 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Schedule Generated Successfully!</h3>
            <p className="text-sm text-gray-500">
              Your tournament schedule has been created and is ready to review.
            </p>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => {}}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform rounded-lg bg-white shadow-xl transition-all sm:w-full sm:max-w-4xl">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      Schedule Generation Wizard
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="rounded-md bg-gray-50 text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Progress Steps */}
                  {currentStep !== 'complete' && (
                    <div className="mt-4">
                      <nav aria-label="Progress">
                        <ol className="flex items-center">
                          {steps.map((step, stepIdx) => {
                            const Icon = step.icon
                            const isActive = getStepIndex(currentStep) === stepIdx
                            const isComplete = getStepIndex(currentStep) > stepIdx
                            
                            return (
                              <li key={step.id} className={stepIdx !== steps.length - 1 ? 'flex-1' : ''}>
                                <div className="flex items-center">
                                  <span
                                    className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                      isComplete
                                        ? 'bg-blue-600'
                                        : isActive
                                        ? 'border-2 border-blue-600 bg-white'
                                        : 'border-2 border-gray-300 bg-white'
                                    }`}
                                  >
                                    {isComplete ? (
                                      <CheckIcon className="h-6 w-6 text-white" />
                                    ) : (
                                      <Icon
                                        className={`h-5 w-5 ${
                                          isActive ? 'text-blue-600' : 'text-gray-400'
                                        }`}
                                      />
                                    )}
                                  </span>
                                  {stepIdx !== steps.length - 1 && (
                                    <div
                                      className={`ml-4 h-0.5 w-full ${
                                        isComplete ? 'bg-blue-600' : 'bg-gray-300'
                                      }`}
                                    />
                                  )}
                                </div>
                                <div className="mt-2">
                                  <span
                                    className={`text-xs font-medium ${
                                      isActive ? 'text-blue-600' : isComplete ? 'text-gray-900' : 'text-gray-500'
                                    }`}
                                  >
                                    {step.name}
                                  </span>
                                </div>
                              </li>
                            )
                          })}
                        </ol>
                      </nav>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="px-6 py-6" style={{ minHeight: '400px' }}>
                  {renderStepContent()}
                </div>

                {/* Footer */}
                {currentStep !== 'generating' && currentStep !== 'complete' && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between">
                      <button
                        onClick={currentStep === 'parameters' ? onClose : handleBack}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        {currentStep === 'parameters' ? 'Cancel' : 'Back'}
                      </button>
                      <button
                        onClick={handleNext}
                        disabled={currentStep === 'comparison' && !selectedOptionId}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {currentStep === 'constraints' ? 'Generate Schedule' : 
                         currentStep === 'comparison' ? 'Apply Schedule' : 'Next'}
                      </button>
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}