import { useState, useEffect } from 'react'
import {
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline'
import { useTournament } from '@/contexts/TournamentContext'
import { Blocker, BlockerType } from '@/types/tournament'

export default function Blockers() {
  const { state, resolveBlocker, detectBlockers, rescheduleMatch } = useTournament()
  const [expandedBlockers, setExpandedBlockers] = useState<Set<string>>(new Set())
  const [filterType, setFilterType] = useState<BlockerType | 'all'>('all')
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning' | 'info'>('all')
  const [isScanning, setIsScanning] = useState(false)

  useEffect(() => {
    // Run initial blocker detection
    detectBlockers()
  }, [detectBlockers])

  const toggleExpanded = (blockerId: string) => {
    const newExpanded = new Set(expandedBlockers)
    if (newExpanded.has(blockerId)) {
      newExpanded.delete(blockerId)
    } else {
      newExpanded.add(blockerId)
    }
    setExpandedBlockers(newExpanded)
  }

  const handleRescan = async () => {
    setIsScanning(true)
    setTimeout(() => {
      detectBlockers()
      setIsScanning(false)
    }, 1500)
  }

  const handleResolve = (blockerId: string) => {
    resolveBlocker(blockerId)
  }

  const handleQuickFix = (blocker: Blocker) => {
    // Simulate quick fix actions based on blocker type
    switch (blocker.type) {
      case 'rest-violation':
        // Suggest rescheduling one of the matches
        const match = state.matches.find(m => m.id === blocker.affectedMatches[0])
        if (match) {
          // Simulate finding a better time slot
          console.log('Suggesting reschedule for match:', match.id)
        }
        break
      case 'court-conflict':
        // Move one match to a different court
        console.log('Moving match to different court')
        break
      default:
        console.log('No quick fix available')
    }
    resolveBlocker(blocker.id)
  }

  const getBlockerIcon = (type: BlockerType) => {
    switch (type) {
      case 'rest-violation':
        return ClockIcon
      case 'availability-conflict':
        return UserGroupIcon
      case 'schedule-conflict':
        return CalendarDaysIcon
      case 'court-conflict':
        return BuildingOfficeIcon
      case 'dependency':
        return ArrowPathIcon
      default:
        return ExclamationCircleIcon
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return ExclamationCircleIcon
      case 'warning':
        return ExclamationTriangleIcon
      case 'info':
        return InformationCircleIcon
      default:
        return InformationCircleIcon
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'info':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getBlockerTypeLabel = (type: BlockerType) => {
    switch (type) {
      case 'rest-violation':
        return 'Rest Violation'
      case 'availability-conflict':
        return 'Availability Conflict'
      case 'schedule-conflict':
        return 'Schedule Conflict'
      case 'court-conflict':
        return 'Court Conflict'
      case 'dependency':
        return 'Dependency Issue'
      default:
        return 'Unknown'
    }
  }

  // Filter blockers
  const filteredBlockers = state.blockers.filter(blocker => {
    if (filterType !== 'all' && blocker.type !== filterType) return false
    if (filterSeverity !== 'all' && blocker.severity !== filterSeverity) return false
    return true
  })

  const activeBlockers = filteredBlockers.filter(b => !b.isResolved)
  const resolvedBlockers = filteredBlockers.filter(b => b.isResolved)

  // Group blockers by type for summary
  const blockersByType = state.blockers.reduce((acc, blocker) => {
    if (!blocker.isResolved) {
      acc[blocker.type] = (acc[blocker.type] || 0) + 1
    }
    return acc
  }, {} as Record<BlockerType, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Schedule Blockers</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage and resolve scheduling conflicts and violations
            </p>
          </div>
          <button
            onClick={handleRescan}
            disabled={isScanning}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={`h-5 w-5 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Rescan Schedule'}
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Critical</p>
                <p className="text-2xl font-bold text-red-700">
                  {state.blockers.filter(b => !b.isResolved && b.severity === 'critical').length}
                </p>
              </div>
              <ExclamationCircleIcon className="h-8 w-8 text-red-400" />
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Warnings</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {state.blockers.filter(b => !b.isResolved && b.severity === 'warning').length}
                </p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-400" />
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Info</p>
                <p className="text-2xl font-bold text-blue-700">
                  {state.blockers.filter(b => !b.isResolved && b.severity === 'info').length}
                </p>
              </div>
              <InformationCircleIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Resolved</p>
                <p className="text-2xl font-bold text-green-700">
                  {state.blockers.filter(b => b.isResolved).length}
                </p>
              </div>
              <CheckCircleIcon className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-700">{state.blockers.length}</p>
              </div>
              <ExclamationTriangleIcon className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              <option value="all">All Types</option>
              <option value="rest-violation">Rest Violations</option>
              <option value="availability-conflict">Availability Conflicts</option>
              <option value="schedule-conflict">Schedule Conflicts</option>
              <option value="court-conflict">Court Conflicts</option>
              <option value="dependency">Dependencies</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="warning">Warning</option>
              <option value="info">Info</option>
            </select>
          </div>

          <div className="flex-1" />

          <div className="text-sm text-gray-500">
            Showing {filteredBlockers.length} of {state.blockers.length} blockers
          </div>
        </div>
      </div>

      {/* Active Blockers */}
      {activeBlockers.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Active Blockers</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {activeBlockers.map((blocker) => {
              const Icon = getBlockerIcon(blocker.type)
              const SeverityIcon = getSeverityIcon(blocker.severity)
              const isExpanded = expandedBlockers.has(blocker.id)
              const affectedMatches = state.matches.filter(m => 
                blocker.affectedMatches.includes(m.id)
              )

              return (
                <div key={blocker.id} className="p-6">
                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg ${getSeverityColor(blocker.severity)}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-sm font-semibold text-gray-900">
                              {getBlockerTypeLabel(blocker.type)}
                            </h4>
                            <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              blocker.severity === 'critical' ? 'bg-red-100 text-red-800' :
                              blocker.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {blocker.severity}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-600">{blocker.description}</p>
                          
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <span>Affects {blocker.affectedMatches.length} matches</span>
                            <span>•</span>
                            <span>Detected {new Date(blocker.createdAt).toLocaleTimeString()}</span>
                          </div>

                          {blocker.suggestedResolution && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                              <div className="flex">
                                <InformationCircleIcon className="h-4 w-4 text-blue-400 flex-shrink-0" />
                                <div className="ml-2">
                                  <p className="text-xs font-medium text-blue-800">Suggested Resolution:</p>
                                  <p className="text-xs text-blue-700 mt-1">{blocker.suggestedResolution}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Expandable affected matches section */}
                          <button
                            onClick={() => toggleExpanded(blocker.id)}
                            className="mt-3 flex items-center text-sm text-gray-500 hover:text-gray-700"
                          >
                            {isExpanded ? (
                              <ChevronDownIcon className="h-4 w-4 mr-1" />
                            ) : (
                              <ChevronRightIcon className="h-4 w-4 mr-1" />
                            )}
                            View affected matches
                          </button>

                          {isExpanded && (
                            <div className="mt-3 space-y-2">
                              {affectedMatches.map(match => (
                                <div key={match.id} className="bg-gray-50 rounded-md p-3 text-sm">
                                  <div className="flex justify-between">
                                    <div>
                                      <span className="font-medium">{match.player1Name} vs {match.player2Name}</span>
                                      <div className="text-xs text-gray-500 mt-1">
                                        {match.drawName} • {match.round} • {match.courtName}
                                      </div>
                                    </div>
                                    <div className="text-right text-xs text-gray-500">
                                      {match.scheduledDate} {match.scheduledTime}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="ml-4 flex flex-col space-y-2">
                          <button
                            onClick={() => handleQuickFix(blocker)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                          >
                            Quick Fix
                          </button>
                          <button
                            onClick={() => handleResolve(blocker.id)}
                            className="px-3 py-1.5 bg-gray-200 text-gray-700 text-sm rounded-md hover:bg-gray-300"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* No Active Blockers */}
      {activeBlockers.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircleIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Blockers</h3>
          <p className="text-sm text-gray-500">
            Your schedule is currently free of conflicts and violations.
          </p>
        </div>
      )}

      {/* Resolved Blockers */}
      {resolvedBlockers.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Resolved Blockers</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {resolvedBlockers.map((blocker) => {
              const Icon = getBlockerIcon(blocker.type)
              
              return (
                <div key={blocker.id} className="p-6 opacity-60">
                  <div className="flex items-start">
                    <div className="p-2 rounded-lg bg-green-50 border border-green-200">
                      <CheckCircleIcon className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <h4 className="text-sm font-semibold text-gray-900 line-through">
                          {getBlockerTypeLabel(blocker.type)}
                        </h4>
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          resolved
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{blocker.description}</p>
                      <div className="mt-2 text-xs text-gray-500">
                        Resolved at {new Date(blocker.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}