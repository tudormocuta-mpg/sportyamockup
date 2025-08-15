import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import ScheduleGenerationWizard from './ScheduleGenerationWizard'
import { ExclamationTriangleIcon, LockClosedIcon, PencilIcon, ArrowPathIcon } from '@heroicons/react/24/outline'

interface ConfigSection {
  title: string
  description: string
  requiresReset: boolean
  fields: ConfigField[]
}

interface ConfigField {
  label: string
  value: string | number | boolean | any
  type: 'text' | 'number' | 'boolean' | 'select' | 'date' | 'time' | 'complex'
  editable: boolean
  requiresReset: boolean
  impact: string
  currentValue?: any
}

const Configuration: React.FC = () => {
  const { state } = useTournament()
  const [activeTab, setActiveTab] = useState<'settings' | 'wizard'>('settings')
  const [editingField, setEditingField] = useState<string | null>(null)
  
  // Mock wizard data - in real app would come from context/storage
  const wizardData = {
    tournamentStart: '2024-08-15',
    tournamentEnd: '2024-08-17',
    matchDuration: 90,
    bufferTime: 15,
    minRestPeriod: 120,
    maxMatchesPerPlayerPerDay: 2,
    finalsCourt: 'c1',
    indoorCourtPriority: false,
    courtsByDay: {
      '2024-08-15': [
        { courtId: 'c3', name: 'Court 3', timeSlots: [{ startTime: '14:00', endTime: '20:00' }] },
        { courtId: 'c6', name: 'Practice Court', timeSlots: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '16:00', endTime: '20:00' }] }
      ],
      '2024-08-16': [
        { courtId: 'c3', name: 'Court 3', timeSlots: [{ startTime: '08:00', endTime: '20:00' }] },
        { courtId: 'c6', name: 'Practice Court', timeSlots: [{ startTime: '08:00', endTime: '20:00' }] }
      ],
      '2024-08-17': [
        { courtId: 'c3', name: 'Court 3', timeSlots: [{ startTime: '08:00', endTime: '20:00' }] },
        { courtId: 'c6', name: 'Practice Court', timeSlots: [{ startTime: '08:00', endTime: '20:00' }] }
      ]
    },
    schedulingRules: [
      { id: 'court-availability', name: 'Court Availability', priority: 1, enabled: true },
      { id: 'player-rest', name: 'Player Rest Time', priority: 2, enabled: true },
      { id: 'player-availability', name: 'Player Availability', priority: 3, enabled: true },
      { id: 'indoor-priority', name: 'Indoor Court Priority', priority: 4, enabled: false },
      { id: 'finals-court', name: 'Finals Court Preference', priority: 5, enabled: true }
    ]
  }

  // Check if schedule has been generated
  const hasGeneratedSchedule = state.matches.some(match => match.scheduledTime && match.scheduledDate)

  // Configuration sections with their fields
  const configSections: ConfigSection[] = [
    {
      title: 'Tournament Timeline',
      description: 'Core tournament dates and duration',
      requiresReset: true,
      fields: [
        {
          label: 'Tournament Start Date',
          value: wizardData.tournamentStart,
          type: 'date',
          editable: false,
          requiresReset: true,
          impact: 'Changing dates requires complete schedule regeneration as it affects all match slots and court availability'
        },
        {
          label: 'Tournament End Date',
          value: wizardData.tournamentEnd,
          type: 'date',
          editable: false,
          requiresReset: true,
          impact: 'Extending or shortening the tournament requires recalculating all match distributions'
        },
        {
          label: 'Total Duration',
          value: `${Math.ceil((new Date(wizardData.tournamentEnd).getTime() - new Date(wizardData.tournamentStart).getTime()) / (1000 * 60 * 60 * 24)) + 1} days`,
          type: 'text',
          editable: false,
          requiresReset: false,
          impact: 'Calculated from start and end dates'
        }
      ]
    },
    {
      title: 'Match Scheduling Parameters',
      description: 'Time allocations for matches and breaks',
      requiresReset: false,
      fields: [
        {
          label: 'Default Match Duration',
          value: `${wizardData.matchDuration} minutes`,
          type: 'number',
          editable: false,
          requiresReset: true,
          impact: 'Affects court slot allocation - changing requires recalculating all time slots'
        },
        {
          label: 'Buffer Time Between Matches',
          value: `${wizardData.bufferTime} minutes`,
          type: 'number',
          editable: false,
          requiresReset: true,
          impact: 'Affects spacing between matches - modification requires complete rescheduling'
        },
        {
          label: 'Minimum Rest Period for Players',
          value: `${wizardData.minRestPeriod} minutes`,
          type: 'number',
          editable: true,
          requiresReset: false,
          impact: 'Can be adjusted if new value doesn\'t conflict with existing schedule'
        },
        {
          label: 'Max Matches Per Player Per Day',
          value: wizardData.maxMatchesPerPlayerPerDay,
          type: 'number',
          editable: true,
          requiresReset: false,
          impact: 'Can be reduced if no player exceeds new limit in current schedule'
        }
      ]
    },
    {
      title: 'Court Allocation by Day',
      description: 'Daily court availability and time slots',
      requiresReset: true,
      fields: Object.entries(wizardData.courtsByDay).map(([date, courts]) => ({
        label: new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
        value: courts,
        type: 'complex' as const,
        editable: false,
        requiresReset: true,
        impact: 'Court availability directly affects match scheduling - any change requires regeneration'
      }))
    },
    {
      title: 'Court Preferences',
      description: 'Special court assignments and priorities',
      requiresReset: false,
      fields: [
        {
          label: 'Preferred Finals Court',
          value: state.courts.find(c => c.id === wizardData.finalsCourt)?.name || 'Court 1',
          type: 'select',
          editable: true,
          requiresReset: false,
          impact: 'Can be changed - only affects future finals match assignments'
        },
        {
          label: 'Indoor Court Priority',
          value: wizardData.indoorCourtPriority,
          type: 'boolean',
          editable: true,
          requiresReset: false,
          impact: 'Preference for future scheduling decisions - doesn\'t affect existing matches'
        }
      ]
    },
    {
      title: 'Scheduling Rules Priority',
      description: 'Rules applied during schedule generation',
      requiresReset: false,
      fields: wizardData.schedulingRules.map(rule => ({
        label: rule.name,
        value: rule.enabled,
        type: 'boolean' as const,
        editable: true,
        requiresReset: false,
        impact: `Priority ${rule.priority} - ${rule.enabled ? 'Active' : 'Inactive'} - Affects future scheduling decisions`,
        currentValue: rule
      }))
    }
  ]

  const handleResetSchedule = () => {
    if (window.confirm('This will clear all scheduled matches and restart the scheduling wizard. Continue?')) {
      setActiveTab('wizard')
    }
  }

  const handleEditField = (fieldLabel: string) => {
    setEditingField(fieldLabel)
    // Implementation for field editing would go here
  }

  if (activeTab === 'wizard') {
    return <ScheduleGenerationWizard />
  }

  return (
    <div className="configuration-container h-full overflow-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tournament Configuration</h2>
              <p className="text-sm text-gray-600 mt-1">Review and manage tournament scheduling parameters</p>
            </div>
            {hasGeneratedSchedule && (
              <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-green-800">Schedule Active</span>
              </div>
            )}
          </div>
        </div>

        {/* Warning Banner */}
        {hasGeneratedSchedule && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-amber-900 mb-1">Active Schedule Warning</h3>
                <p className="text-sm text-amber-700">
                  A tournament schedule is currently active. Some configuration changes require resetting the entire schedule.
                  Fields marked with a lock icon cannot be modified without regenerating all match assignments.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Sections */}
        <div className="space-y-6">
          {configSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Section Header */}
              <div className={`px-6 py-4 border-b ${section.requiresReset ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">{section.description}</p>
                  </div>
                  {section.requiresReset && hasGeneratedSchedule && (
                    <div className="flex items-center text-red-600">
                      <LockClosedIcon className="w-4 h-4 mr-1" />
                      <span className="text-xs font-medium">Requires Reset</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Section Fields */}
              <div className="divide-y divide-gray-100">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-1">
                          <label className="text-sm font-medium text-gray-900">
                            {field.label}
                          </label>
                          {field.requiresReset && hasGeneratedSchedule && (
                            <LockClosedIcon className="w-3 h-3 text-gray-400 ml-2" />
                          )}
                          {field.editable && !field.requiresReset && hasGeneratedSchedule && (
                            <button
                              onClick={() => handleEditField(field.label)}
                              className="ml-2 text-blue-600 hover:text-blue-800"
                            >
                              <PencilIcon className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        
                        {/* Field Value Display */}
                        <div className="mb-2">
                          {field.type === 'complex' ? (
                            // Special rendering for court allocation
                            <div className="mt-2 space-y-2">
                              {(field.value as any[]).map((court: any, index: number) => (
                                <div key={index} className="bg-gray-50 rounded-lg p-3 text-xs">
                                  <div className="font-medium text-gray-900">{court.name}</div>
                                  <div className="mt-1 text-gray-600">
                                    Time Slots: {court.timeSlots.map((slot: any) => 
                                      `${slot.startTime}-${slot.endTime}`
                                    ).join(', ')}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : field.type === 'boolean' ? (
                            <div className="flex items-center">
                              <div className={`w-8 h-5 rounded-full ${field.value ? 'bg-blue-600' : 'bg-gray-300'} relative transition-colors`}>
                                <div className={`w-3 h-3 bg-white rounded-full absolute top-1 transition-transform ${field.value ? 'translate-x-4' : 'translate-x-1'}`}></div>
                              </div>
                              <span className="ml-2 text-sm text-gray-700">{field.value ? 'Enabled' : 'Disabled'}</span>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-700 font-medium">
                              {field.value.toString()}
                            </div>
                          )}
                        </div>
                        
                        {/* Impact Description */}
                        <div className="text-xs text-gray-500 italic">
                          <span className="font-medium">Impact:</span> {field.impact}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Configuration Actions</h3>
              <p className="text-xs text-gray-600">Manage your tournament schedule configuration</p>
            </div>
            <div className="flex space-x-3">
              {hasGeneratedSchedule && (
                <button
                  onClick={handleResetSchedule}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center"
                >
                  <ArrowPathIcon className="w-4 h-4 mr-2" />
                  Reset & Regenerate Schedule
                </button>
              )}
              {!hasGeneratedSchedule && (
                <button
                  onClick={() => setActiveTab('wizard')}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Open Schedule Wizard
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Information Footer */}
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Configuration was set during initial schedule generation.</p>
          <p>Some parameters can be adjusted without regenerating the schedule.</p>
        </div>
      </div>
    </div>
  )
}

export default Configuration