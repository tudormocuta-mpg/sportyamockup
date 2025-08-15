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
  const tournamentContext = useTournament()
  
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  const [currentStep, setCurrentStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedOptions, setGeneratedOptions] = useState<ScheduleOption[]>([])
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isCourtModalOpen, setIsCourtModalOpen] = useState(false)
  const [courtModalData, setCourtModalData] = useState<{
    date: string
    courtId: string
    courtName: string
    surface: string
    indoor: boolean
    timeSlots: Array<{startTime: string, endTime: string}>
    maintenanceBlocks: Array<{startTime: string, endTime: string, description: string}>
    isEditing: boolean
    editIndex?: number
  } | null>(null)
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [dragOverItem, setDragOverItem] = useState<number | null>(null)
  
  const [wizardData, setWizardData] = useState(() => ({
    // Tournament Setup
    tournamentStart: '2024-08-15',
    tournamentEnd: '2024-08-17',
    matchDuration: 90,
    bufferTime: 15,
    minRestPeriod: 120, // Changed to match recommended option
    maxMatchesPerPlayerPerDay: 2, // Changed to a reasonable default
    
    // Court Allocation - Demo data with limited availability
    courtsByDay: {
      '2024-08-15': [
        {
          courtId: 'c3-2024-08-15',
          name: 'Court 3',
          surface: 'clay',
          indoor: false,
          available: true,
          timeSlots: [
            { startTime: '14:00', endTime: '20:00' } // Only afternoon available (half day blocked)
          ],
          maintenanceBlocks: []
        },
        {
          courtId: 'c6-2024-08-15',
          name: 'Practice Court',
          surface: 'hard',
          indoor: false,
          available: true,
          timeSlots: [
            { startTime: '08:00', endTime: '12:00' }, // Morning session
            { startTime: '16:00', endTime: '20:00' }  // Evening session (4 hours blocked 12-16)
          ],
          maintenanceBlocks: []
        }
      ],
      '2024-08-16': [
        {
          courtId: 'c3-2024-08-16',
          name: 'Court 3',
          surface: 'clay',
          indoor: false,
          available: true,
          timeSlots: [
            { startTime: '08:00', endTime: '20:00' } // Full day available
          ],
          maintenanceBlocks: []
        },
        {
          courtId: 'c6-2024-08-16',
          name: 'Practice Court',
          surface: 'hard',
          indoor: false,
          available: true,
          timeSlots: [
            { startTime: '08:00', endTime: '20:00' } // Full day available
          ],
          maintenanceBlocks: []
        }
      ],
      '2024-08-17': [
        {
          courtId: 'c3-2024-08-17',
          name: 'Court 3',
          surface: 'clay',
          indoor: false,
          available: true,
          timeSlots: [
            { startTime: '08:00', endTime: '20:00' } // Full day available
          ],
          maintenanceBlocks: []
        },
        {
          courtId: 'c6-2024-08-17',
          name: 'Practice Court',
          surface: 'hard',
          indoor: false,
          available: true,
          timeSlots: [
            { startTime: '08:00', endTime: '20:00' } // Full day available
          ],
          maintenanceBlocks: []
        }
      ]
    } as Record<string, Array<{
      courtId: string
      name: string
      surface: string
      indoor: boolean
      available: boolean
      timeSlots: Array<{startTime: string, endTime: string}>
      maintenanceBlocks: Array<{startTime: string, endTime: string, description: string}>
    }>>,
    finalsCourt: 'c1',
    indoorCourtPriority: false,
    
    // Scheduling Rules Priority
    schedulingRules: [
      { id: 'court-availability', name: 'Court Availability', priority: 1, enabled: true },
      { id: 'player-rest', name: 'Player Rest Time', priority: 2, enabled: true },
      { id: 'player-availability', name: 'Player Availability', priority: 3, enabled: true },
      { id: 'indoor-priority', name: 'Indoor Court Priority', priority: 4, enabled: false },
      { id: 'finals-court', name: 'Finals Court Preference', priority: 5, enabled: true }
    ]
  }))

  // ALL MEMOIZED VALUES AND CALLBACKS - MUST BE BEFORE CONDITIONAL RETURNS
  const steps: WizardStep[] = React.useMemo(() => [
    {
      id: 'setup',
      title: 'Tournament Setup',
      description: 'Set dates, match durations, and scheduling rules',
      completed: false
    },
    {
      id: 'courts',
      title: 'Court Allocation',
      description: 'Configure courts for each tournament day',
      completed: false
    },
    {
      id: 'preferences',
      title: 'Scheduling Rules Priority',
      description: 'Configure and prioritize scheduling rules',
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
  ], [])

  // Get context data safely
  const { state, applySchedule, resetSchedule } = tournamentContext || {}

  // Memoized values for tournament state checks
  const isFreshTournament = React.useMemo(() => {
    try {
      if (!state?.matches) return true
      return state.matches.every(match => !match.scheduledTime || !match.scheduledDate)
    } catch (error) {
      console.warn('Error checking fresh tournament status:', error)
      return true
    }
  }, [state?.matches])
  
  const hasGeneratedSchedule = React.useMemo(() => {
    try {
      if (!state?.matches) return false
      return state.matches.some(match => match.scheduledTime && match.scheduledDate)
    } catch (error) {
      console.warn('Error checking generated schedule status:', error)
      return false
    }
  }, [state?.matches])

  // Helper function to get tournament days
  const getTournamentDays = React.useMemo(() => {
    const start = new Date(wizardData.tournamentStart)
    const end = new Date(wizardData.tournamentEnd)
    const days = []
    
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d).toISOString().split('T')[0])
    }
    
    return days
  }, [wizardData.tournamentStart, wizardData.tournamentEnd])

  const handleApplySchedule = React.useCallback(() => {
    if (selectedOption && applySchedule) {
      try {
        // Apply the full scheduled mock data
        applySchedule()
        
        // Component will automatically show success message because hasGeneratedSchedule will be true
        // Reset step to show success message
        setCurrentStep(0)
      } catch (error) {
        console.error('Error applying schedule:', error)
      }
    }
  }, [selectedOption, applySchedule])

  const handleResetSchedule = React.useCallback(() => {
    if (resetSchedule) {
      try {
        // Reset all scheduled matches to unscheduled state
        resetSchedule()
        
        // Reset wizard state
        setCurrentStep(0)
        setGeneratedOptions([])
        setSelectedOption(null)
        setIsGenerating(false)
      } catch (error) {
        console.error('Error resetting schedule:', error)
      }
    }
  }, [resetSchedule])

  // CONDITIONAL RETURNS AFTER ALL HOOKS
  if (!tournamentContext) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <div className="text-gray-600">Loading tournament context...</div>
        </div>
      </div>
    )
  }
  
  if (!state) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <div className="text-gray-600">Loading tournament data...</div>
        </div>
      </div>
    )
  }
  
  if (!state.matches || !Array.isArray(state.matches)) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-600 mb-2">⚠️</div>
          <div className="text-gray-600">Tournament data not available</div>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  const generateScheduleOptions = async () => {
    setIsGenerating(true)
    
    // Simulate generation process
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    // Calculate tournament duration from wizard data
    const startDate = new Date(wizardData.tournamentStart)
    const endDate = new Date(wizardData.tournamentEnd)
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    const durationText = `${totalDays} day${totalDays > 1 ? 's' : ''}`
    
    const mockOptions: ScheduleOption[] = [
      {
        id: 'compact',
        name: 'Compact Schedule',
        description: 'Minimize tournament duration with intensive daily schedules',
        duration: durationText,
        tradeoffs: ['Less rest time between matches', 'Earlier start/later finish', 'Less sensitive to player availability'],
        qualityScore: 85,
        details: {
          totalDays: totalDays,
          matchesPerDay: 18,
          courtUtilization: 92,
          playerRestTime: 75
        }
      },
      {
        id: 'relaxed',
        name: 'Relaxed Schedule',
        description: 'Spread matches and create better rest periods',
        duration: durationText,
        tradeoffs: ['Lower court utilization', 'Less options in case major rescheduling of matches is required'],
        qualityScore: 92,
        details: {
          totalDays: totalDays,
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

  // Helper function to open court configuration modal
  const openCourtModal = (date: string, courtId: string, isEditing: boolean = false, editIndex?: number) => {
    const court = state.courts.find(c => c.id === courtId)
    if (!court) return

    if (isEditing && editIndex !== undefined) {
      // Load existing court data for editing
      const existingCourt = wizardData.courtsByDay[date]?.[editIndex]
      if (existingCourt) {
        setCourtModalData({
          date,
          courtId,
          courtName: existingCourt.name,
          surface: existingCourt.surface,
          indoor: existingCourt.indoor,
          timeSlots: [...existingCourt.timeSlots],
          maintenanceBlocks: [...existingCourt.maintenanceBlocks],
          isEditing: true,
          editIndex
        })
      }
    } else {
      // New court configuration
      setCourtModalData({
        date,
        courtId,
        courtName: court.name,
        surface: court.surface,
        indoor: court.indoor,
        timeSlots: [{ startTime: '09:00', endTime: '17:00' }],
        maintenanceBlocks: [],
        isEditing: false
      })
    }
    setIsCourtModalOpen(true)
  }

  // Helper function to save court configuration
  const saveCourtConfiguration = (applyToAllDays: boolean = false) => {
    if (!courtModalData) return

    const courtData = {
      courtId: `${courtModalData.courtId}-${courtModalData.date}`,
      name: courtModalData.courtName,
      surface: courtModalData.surface,
      indoor: courtModalData.indoor,
      available: true,
      timeSlots: [...courtModalData.timeSlots],
      maintenanceBlocks: [...courtModalData.maintenanceBlocks]
    }

    setWizardData(prev => {
      const newCourtsByDay = { ...prev.courtsByDay }
      
      if (applyToAllDays) {
        // Apply to all remaining days (including current day)
        const currentDayIndex = getTournamentDays.indexOf(courtModalData.date)
        getTournamentDays.slice(currentDayIndex).forEach(day => {
          if (!newCourtsByDay[day]) newCourtsByDay[day] = []
          
          // Check if court already exists for this day
          const existingIndex = newCourtsByDay[day].findIndex(c => c.courtId.startsWith(courtModalData.courtId))
          
          if (existingIndex >= 0) {
            // Update existing court
            newCourtsByDay[day][existingIndex] = {
              ...courtData,
              courtId: `${courtModalData.courtId}-${day}`
            }
          } else {
            // Add new court
            newCourtsByDay[day].push({
              ...courtData,
              courtId: `${courtModalData.courtId}-${day}`
            })
          }
        })
      } else {
        // Apply to specific day only
        if (!newCourtsByDay[courtModalData.date]) {
          newCourtsByDay[courtModalData.date] = []
        }
        
        if (courtModalData.isEditing && courtModalData.editIndex !== undefined) {
          // Update existing court
          newCourtsByDay[courtModalData.date][courtModalData.editIndex] = courtData
        } else {
          // Add new court
          newCourtsByDay[courtModalData.date].push(courtData)
        }
      }
      
      return { ...prev, courtsByDay: newCourtsByDay }
    })

    setIsCourtModalOpen(false)
    setCourtModalData(null)
  }

  // Helper function to remove court from day
  const removeCourtFromDay = (date: string, courtIndex: number) => {
    setWizardData(prev => {
      const newCourtsByDay = { ...prev.courtsByDay }
      if (newCourtsByDay[date]) {
        newCourtsByDay[date].splice(courtIndex, 1)
      }
      return { ...prev, courtsByDay: newCourtsByDay }
    })
  }

  // Helper functions for time slot management
  const addTimeSlot = () => {
    if (!courtModalData) return
    setCourtModalData({
      ...courtModalData,
      timeSlots: [...courtModalData.timeSlots, { startTime: '09:00', endTime: '17:00' }]
    })
  }

  const updateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
    if (!courtModalData) return
    const newTimeSlots = [...courtModalData.timeSlots]
    newTimeSlots[index][field] = value
    setCourtModalData({ ...courtModalData, timeSlots: newTimeSlots })
  }

  const removeTimeSlot = (index: number) => {
    if (!courtModalData || courtModalData.timeSlots.length <= 1) return
    const newTimeSlots = courtModalData.timeSlots.filter((_, i) => i !== index)
    setCourtModalData({ ...courtModalData, timeSlots: newTimeSlots })
  }

  const moveRule = (fromIndex: number, toIndex: number) => {
    setWizardData(prev => {
      const newRules = [...prev.schedulingRules]
      const [movedRule] = newRules.splice(fromIndex, 1)
      newRules.splice(toIndex, 0, movedRule)
      
      // Update priority numbers
      const updatedRules = newRules.map((rule, index) => ({
        ...rule,
        priority: index + 1
      }))
      
      return { ...prev, schedulingRules: updatedRules }
    })
  }

  // Drag & drop handlers for scheduling rules
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.outerHTML)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverItem(index)
  }

  const handleDragLeave = () => {
    setDragOverItem(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    if (draggedItem !== null && draggedItem !== dropIndex) {
      moveRule(draggedItem, dropIndex)
    }
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const renderStepContent = () => {
    switch (steps[currentStep].id) {
      case 'setup':
        return (
          <div className="space-y-8">
            {/* Tournament Duration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Tournament Duration</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament Start Date
                  </label>
                  <input
                    type="date"
                    value={wizardData.tournamentStart}
                    onChange={(e) => setWizardData(prev => ({ ...prev, tournamentStart: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament End Date
                  </label>
                  <input
                    type="date"
                    value={wizardData.tournamentEnd}
                    onChange={(e) => setWizardData(prev => ({ ...prev, tournamentEnd: e.target.value }))}
                    min={wizardData.tournamentStart}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="mt-2 text-sm text-gray-600">
                Duration: {getTournamentDays.length} day{getTournamentDays.length !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Match Configuration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Configuration</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Match Duration (minutes)
                  </label>
                  <select
                    value={wizardData.matchDuration}
                    onChange={(e) => setWizardData(prev => ({ ...prev, matchDuration: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes (recommended)</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buffer Time Between Matches (minutes)
                  </label>
                  <select
                    value={wizardData.bufferTime}
                    onChange={(e) => setWizardData(prev => ({ ...prev, bufferTime: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Player Management */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Player Scheduling Rules</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Rest Period (minutes)
                  </label>
                  <select
                    value={wizardData.minRestPeriod}
                    onChange={(e) => setWizardData(prev => ({ ...prev, minRestPeriod: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value={60}>60 minutes</option>
                    <option value={120}>120 minutes (recommended)</option>
                    <option value={180}>180 minutes</option>
                  </select>
                  <div className="mt-1 text-xs text-gray-500">
                    Time between consecutive matches for the same player
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Matches Per Player Per Day
                  </label>
                  <select
                    value={wizardData.maxMatchesPerPlayerPerDay}
                    onChange={(e) => setWizardData(prev => ({ ...prev, maxMatchesPerPlayerPerDay: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value={1}>1 match</option>
                    <option value={2}>2 matches</option>
                    <option value={3}>3 matches</option>
                    <option value={4}>4 matches</option>
                  </select>
                  <div className="mt-1 text-xs text-gray-500">
                    Maximum number of matches per player in a single day
                  </div>
                </div>
              </div>
            </div>

            {/* Configuration Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-purple-900 mb-3">Tournament Overview</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-700">{getTournamentDays.length}</div>
                  <div className="text-purple-600">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">{state.matches.length}</div>
                  <div className="text-blue-600">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{state.players.length}</div>
                  <div className="text-green-600">Players</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-700">{wizardData.matchDuration}min</div>
                  <div className="text-orange-600">Match Duration</div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'courts':
        return (
          <div className="space-y-8">
            {/* Court Management Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Court Preferences</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Finals Court
                  </label>
                  <select
                    value={wizardData.finalsCourt}
                    onChange={(e) => setWizardData(prev => ({ ...prev, finalsCourt: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    {state.courts.map(court => (
                      <option key={court.id} value={court.id}>
                        {court.name} ({court.surface})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wizardData.indoorCourtPriority}
                      onChange={(e) => setWizardData(prev => ({ ...prev, indoorCourtPriority: e.target.checked }))}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-900">Indoor Court Priority</span>
                      <div className="text-xs text-gray-500">Prioritize indoor courts for important matches</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Day-by-Day Court Configuration */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Court Configuration</h3>
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <div className="text-sm text-green-800">
                  Configure courts for each day of your tournament. You can add existing courts or create custom court configurations per day.
                </div>
              </div>

              {getTournamentDays.map((date, dayIndex) => {
                const dayName = new Date(date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'short', 
                  day: 'numeric' 
                })
                const dayCourts = wizardData.courtsByDay[date] || []

                return (
                  <div key={date} className="bg-white border-2 border-gray-200 rounded-lg p-6 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Day {dayIndex + 1}: {dayName}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="text-gray-600">
                          {dayCourts.length} of {state.courts.length} courts configured
                        </div>
                        {dayCourts.length === state.courts.length && (
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            All courts added
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Existing Courts for This Day */}
                    <div className="space-y-3 mb-4">
                      {dayCourts.map((court, courtIndex) => (
                        <div key={courtIndex} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{court.name}</div>
                              <div className="text-sm text-gray-600">
                                {court.surface} • {court.indoor ? 'Indoor' : 'Outdoor'}
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => openCourtModal(date, court.courtId.split('-')[0], true, courtIndex)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => removeCourtFromDay(date, courtIndex)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                          
                          {/* Display Time Slots */}
                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-700 mb-2">Available Time Slots:</div>
                            <div className="flex flex-wrap gap-2">
                              {court.timeSlots.map((slot, slotIndex) => (
                                <div key={slotIndex} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                  {slot.startTime} - {slot.endTime}
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Display Maintenance Blocks if any */}
                          {court.maintenanceBlocks.length > 0 && (
                            <div>
                              <div className="text-xs font-medium text-gray-700 mb-2">Maintenance Blocks:</div>
                              <div className="flex flex-wrap gap-2">
                                {court.maintenanceBlocks.map((block, blockIndex) => (
                                  <div key={blockIndex} className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                                    {block.startTime} - {block.endTime}: {block.description}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add Court Controls */}
                    <div className="border-t pt-4">
                      <h5 className="font-medium text-gray-900 mb-3">Add Courts for {dayName}</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {state.courts.map(court => {
                          // Check if this court is already added for this day
                          const isAlreadyAdded = dayCourts.some(dayCourtItem => 
                            dayCourtItem.courtId.startsWith(court.id)
                          )
                          
                          return (
                            <button
                              key={court.id}
                              onClick={() => {
                                if (!isAlreadyAdded) {
                                  openCourtModal(date, court.id)
                                }
                              }}
                              disabled={isAlreadyAdded}
                              className={`flex items-center justify-between p-3 border-2 rounded-lg transition-colors text-left ${
                                isAlreadyAdded
                                  ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-50'
                                  : 'border-dashed border-gray-300 hover:border-green-500 hover:bg-green-50 cursor-pointer'
                              }`}
                            >
                              <div>
                                <div className={`font-medium ${isAlreadyAdded ? 'text-gray-500' : 'text-gray-900'}`}>
                                  {court.name}
                                </div>
                                <div className={`text-sm ${isAlreadyAdded ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {court.surface} • {court.indoor ? 'Indoor' : 'Outdoor'}
                                  {isAlreadyAdded && (
                                    <span className="ml-2 text-xs font-medium text-gray-500">
                                      (Already added)
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className={isAlreadyAdded ? 'text-gray-400' : 'text-green-600'}>
                                <span className="text-xl">
                                  {isAlreadyAdded ? '✓' : '⚙️'}
                                </span>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )

      case 'preferences':
        return (
          <div className="space-y-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Drag to reorder rule priority. Higher priority rules are applied first during schedule generation.
              </p>
            </div>
            
            <div className="space-y-2">
              {wizardData.schedulingRules.map((rule, index) => {
                const isDragging = draggedItem === index
                const isDragOver = dragOverItem === index
                
                return (
                  <div
                    key={rule.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-all cursor-move ${
                      isDragging 
                        ? 'opacity-50 bg-purple-100 border-purple-300 shadow-lg transform scale-105' 
                        : isDragOver
                        ? 'bg-purple-50 border-purple-300 border-dashed'
                        : 'bg-gray-50 border-gray-200 hover:shadow-sm hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-gray-400 cursor-grab active:cursor-grabbing">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM13 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/>
                          </svg>
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                          isDragging ? 'bg-purple-400 text-white' : 'bg-purple-600 text-white'
                        }`}>
                          {rule.priority}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">{rule.name}</span>
                        <div className="text-xs text-gray-600 mt-1">
                          {rule.id === 'court-availability' && 'Ensure courts are available during scheduled times'}
                          {rule.id === 'player-rest' && 'Maintain minimum rest period between matches'}
                          {rule.id === 'finals-court' && 'Use designated court for final matches'}
                          {rule.id === 'indoor-priority' && 'Prefer indoor courts for important matches'}
                          {rule.id === 'player-availability' && 'Match player availability preferences'}
                        </div>
                      </div>
                    </div>
                  
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={(e) => {
                          setWizardData(prev => ({
                            ...prev,
                            schedulingRules: prev.schedulingRules.map((r, i) => 
                              i === index ? { ...r, enabled: e.target.checked } : r
                            )
                          }))
                        }}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="ml-2 text-sm text-gray-600">Enabled</span>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2">Active Rules Summary:</h4>
              <div className="text-sm text-purple-700 space-y-1">
                {wizardData.schedulingRules.filter(r => r.enabled).map(rule => (
                  <div key={rule.id}>#{rule.priority} {rule.name}</div>
                ))}
                {wizardData.schedulingRules.filter(r => r.enabled).length === 0 && (
                  <div className="text-purple-600">No rules enabled - scheduling may be unpredictable</div>
                )}
              </div>
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
        
        {/* Success Message - Schedule Already Generated */}
        {hasGeneratedSchedule && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex items-start mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">
                  Tournament Schedule Generated Successfully!
                </h2>
                <p className="text-gray-600 text-sm">
                  Your tournament schedule has been created with all matches assigned to courts and time slots.
                </p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Schedule Summary</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center mb-1">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-medium text-gray-700">Match Assignments</span>
                  </div>
                  <div className="text-xs text-gray-500">All matches scheduled</div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center mb-1">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-medium text-gray-700">Court Optimization</span>
                  </div>
                  <div className="text-xs text-gray-500">Maximized utilization</div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center mb-1">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-medium text-gray-700">Scheduling Rules</span>
                  </div>
                  <div className="text-xs text-gray-500">All constraints applied</div>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <div className="flex items-center mb-1">
                    <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-xs font-medium text-gray-700">Timeline Complete</span>
                  </div>
                  <div className="text-xs text-gray-500">Dates and times set</div>
                </div>
              </div>
            </div>

            {/* Schedule Status Notice */}
            <div className={`border rounded-lg p-4 mb-4 ${
              state.scheduleStatus === 'published' 
                ? 'bg-green-50 border-green-200' 
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex">
                <div className="flex-shrink-0">
                  {state.scheduleStatus === 'published' ? (
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h3 className={`text-sm font-semibold ${
                    state.scheduleStatus === 'published' ? 'text-green-800' : 'text-amber-800'
                  }`}>
                    Schedule Status: {state.scheduleStatus === 'published' ? 'PUBLIC' : 'Private'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    state.scheduleStatus === 'published' ? 'text-green-700' : 'text-amber-700'
                  }`}>
                    {state.scheduleStatus === 'published' ? (
                      <>Your schedule is <strong>Public</strong> and visible on the tournament page.</>
                    ) : (
                      <>
                        Your schedule is currently <strong>Private</strong> and not visible on the official tournament page on Sportya. 
                        To make it public, use the <strong>Publish</strong> button in the top-right corner of the screen.
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex items-start">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm mb-2">Reset Tournament Schedule</h4>
                  <p className="text-gray-600 text-xs mb-3">
                    Need to regenerate? This will clear all scheduled matches and restart the wizard.
                  </p>
                  
                  <button
                    onClick={handleResetSchedule}
                    className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Reset & Restart Wizard
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Welcome Message for First-Time Users */}
        {isFreshTournament && (
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-8 mb-6 text-white">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🎾</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Welcome to Tournament Scheduler!</h2>
                <p className="text-purple-100">Let&apos;s create your tournament schedule in just a few steps</p>
              </div>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <p className="mb-3">This wizard will guide you through:</p>
              <div className="grid md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center">
                  <span className="text-green-300 mr-2">✓</span>
                  Setting tournament priorities and constraints
                </div>
                <div className="flex items-center">
                  <span className="text-green-300 mr-2">✓</span>
                  Configuring court preferences and timing
                </div>
                <div className="flex items-center">
                  <span className="text-green-300 mr-2">✓</span>
                  Generating optimized schedule options
                </div>
                <div className="flex items-center">
                  <span className="text-green-300 mr-2">✓</span>
                  Choosing the best schedule for your event
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Enhanced Progress Steps - Only show for fresh tournaments */}
        {isFreshTournament && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">Setup Progress</h3>
            
            <div className="relative">
              {/* Progress Bar Background */}
              <div className="absolute top-6 left-0 right-0 h-0.5 bg-gray-200"></div>
              {/* Active Progress Bar */}
              <div 
                className="absolute top-6 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>
              
              {/* Steps */}
              <div className="relative flex justify-between">
                {steps.map((step, index) => {
                  const isActive = index === currentStep
                  const isCompleted = index < currentStep
                  const isUpcoming = index > currentStep
                  
                  return (
                    <div key={step.id} className="flex flex-col items-center" style={{ width: '180px' }}>
                      {/* Step Circle */}
                      <div className={`relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg ring-4 ring-purple-200' 
                          : isCompleted
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isCompleted ? (
                          <span className="text-xl">✓</span>
                        ) : (
                          <span>{index + 1}</span>
                        )}
                        
                        {/* Active Step Pulse Animation */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 animate-ping opacity-20"></div>
                        )}
                      </div>
                      
                      {/* Step Content */}
                      <div className="mt-4 text-center">
                        <div className={`text-sm font-bold mb-1 transition-colors ${
                          isActive 
                            ? 'text-purple-700' 
                            : isCompleted
                            ? 'text-green-700'
                            : 'text-gray-500'
                        }`}>
                          {step.title}
                        </div>
                        <div className={`text-xs leading-tight transition-colors ${
                          isActive 
                            ? 'text-purple-600' 
                            : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-400'
                        }`}>
                          {step.description}
                        </div>
                        
                        {/* Status Badge */}
                        <div className="mt-2">
                          {isActive && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Current
                            </span>
                          )}
                          {isCompleted && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Complete
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              Upcoming
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            
            {/* Progress Summary */}
            <div className="mt-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center text-green-700">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                    <span className="font-medium">{currentStep} of {steps.length} completed</span>
                  </div>
                  <div className="text-gray-600">
                    Step {currentStep + 1}: {steps[currentStep].title}
                  </div>
                </div>
                <div className="text-purple-700 font-medium">
                  {Math.round((currentStep / (steps.length - 1)) * 100)}% Complete
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step Content - Only show for fresh tournaments */}
        {isFreshTournament && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">{steps[currentStep].title}</h2>
              <p className="text-gray-600">{steps[currentStep].description}</p>
            </div>

            {renderStepContent()}
          </div>
        )}

        {/* Navigation - Only show for fresh tournaments */}
        {isFreshTournament && (
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
                onClick={handleApplySchedule}
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
        )}

        {/* Court Configuration Modal */}
        {isCourtModalOpen && courtModalData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    {courtModalData.isEditing ? 'Edit' : 'Configure'} {courtModalData.courtName}
                  </h3>
                  <button
                    onClick={() => {
                      setIsCourtModalOpen(false)
                      setCourtModalData(null)
                    }}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Court Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Court Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Surface:</span>
                        <span className="ml-2 font-medium">{courtModalData.surface}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Type:</span>
                        <span className="ml-2 font-medium">{courtModalData.indoor ? 'Indoor' : 'Outdoor'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-600">Date:</span>
                        <span className="ml-2 font-medium">
                          {new Date(courtModalData.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Time Slots Configuration */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="font-medium text-gray-900">Available Time Slots</h4>
                      <button
                        onClick={addTimeSlot}
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        + Add Slot
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {courtModalData.timeSlots.map((slot, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                              <input
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                              <input
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                              />
                            </div>
                          </div>
                          {courtModalData.timeSlots.length > 1 && (
                            <button
                              onClick={() => removeTimeSlot(index)}
                              className="text-red-600 hover:text-red-800 p-2"
                              title="Remove time slot"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-blue-800">
                        <strong>Example:</strong> A court available 9am-11am and 2pm-9pm would have two time slots:
                        <br />• Slot 1: 09:00 - 11:00
                        <br />• Slot 2: 14:00 - 21:00
                      </div>
                    </div>
                  </div>

                  {/* Save Options */}
                  <div className="border-t pt-4">
                    <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-yellow-900 mb-2">Save Options</h4>
                      <div className="text-sm text-yellow-800">
                        Choose whether to apply this court configuration only to{' '}
                        <strong>{new Date(courtModalData.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'short', 
                          day: 'numeric' 
                        })}</strong>{' '}
                        or to all remaining tournament days.
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={() => saveCourtConfiguration(false)}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        Save for This Day Only
                      </button>
                      <button
                        onClick={() => saveCourtConfiguration(true)}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Save for All Remaining Days
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ScheduleGenerationWizard