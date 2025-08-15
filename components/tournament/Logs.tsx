import React, { useState, useMemo } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { LogEntry, LogSeverity, LogActionType } from '../../types/tournament'
import { 
  FunnelIcon, 
  MagnifyingGlassIcon, 
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CalendarIcon,
  DocumentArrowDownIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const Logs: React.FC = () => {
  const { state } = useTournament()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<LogActionType | 'all'>('all')
  const [filterSeverity, setFilterSeverity] = useState<LogSeverity | 'all'>('all')
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())
  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'all'>('today')

  // Get severity icon and color
  const getSeverityIcon = (severity: LogSeverity) => {
    switch (severity) {
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />
      default:
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />
    }
  }

  const getSeverityBgColor = (severity: LogSeverity) => {
    switch (severity) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-blue-50 border-blue-200'
    }
  }

  const getActionTypeLabel = (type: LogActionType) => {
    const labels: Record<LogActionType, string> = {
      'match_scheduled': 'Match Scheduled',
      'match_rescheduled': 'Match Rescheduled',
      'match_score_entered': 'Score Entered',
      'match_status_changed': 'Status Changed',
      'schedule_generated': 'Schedule Generated',
      'schedule_published': 'Schedule Published',
      'schedule_unpublished': 'Schedule Unpublished',
      'blocker_added': 'Blocker Added',
      'blocker_removed': 'Blocker Removed',
      'court_modified': 'Court Modified',
      'configuration_changed': 'Config Changed',
      'export_generated': 'Export Generated',
      'system_error': 'System Error'
    }
    return labels[type]
  }

  const getActionTypeColor = (type: LogActionType) => {
    if (type.startsWith('match_')) return 'text-blue-600 bg-blue-100'
    if (type.startsWith('schedule_')) return 'text-purple-600 bg-purple-100'
    if (type.startsWith('blocker_')) return 'text-red-600 bg-red-100'
    if (type === 'court_modified') return 'text-green-600 bg-green-100'
    if (type === 'export_generated') return 'text-indigo-600 bg-indigo-100'
    if (type === 'system_error') return 'text-red-600 bg-red-100'
    return 'text-gray-600 bg-gray-100'
  }

  // Filter logs based on date
  const filterByDate = (log: LogEntry) => {
    const logDate = new Date(log.timestamp)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    switch (dateFilter) {
      case 'today':
        return logDate >= today
      case 'week':
        const weekAgo = new Date(today)
        weekAgo.setDate(weekAgo.getDate() - 7)
        return logDate >= weekAgo
      default:
        return true
    }
  }

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    return state.logs
      .filter(log => {
        // Date filter
        if (!filterByDate(log)) return false
        
        // Type filter
        if (filterType !== 'all' && log.actionType !== filterType) return false
        
        // Severity filter
        if (filterSeverity !== 'all' && log.severity !== filterSeverity) return false
        
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase()
          return (
            log.title.toLowerCase().includes(searchLower) ||
            log.description.toLowerCase().includes(searchLower) ||
            log.details?.matchId?.toLowerCase().includes(searchLower) ||
            log.details?.courtId?.toLowerCase().includes(searchLower)
          )
        }
        
        return true
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [state.logs, filterType, filterSeverity, searchTerm, dateFilter])

  // Toggle log expansion
  const toggleLogExpansion = (logId: string) => {
    setExpandedLogs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(logId)) {
        newSet.delete(logId)
      } else {
        newSet.add(logId)
      }
      return newSet
    })
  }

  // Export logs
  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'Severity', 'Title', 'Description'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toISOString(),
        log.actionType,
        log.severity,
        `"${log.title}"`,
        `"${log.description}"`
      ].join(','))
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tournament-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  // Stats calculation
  const stats = useMemo(() => {
    const todayLogs = state.logs.filter(filterByDate)
    return {
      total: todayLogs.length,
      errors: todayLogs.filter(l => l.severity === 'error').length,
      warnings: todayLogs.filter(l => l.severity === 'warning').length,
      matchActions: todayLogs.filter(l => l.actionType.startsWith('match_')).length
    }
  }, [state.logs, dateFilter])

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Activity Logs</h2>
            <p className="text-sm text-gray-600 mt-1">Track all tournament management actions and changes</p>
          </div>
          <button
            onClick={exportLogs}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-600">Total Actions</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{stats.matchActions}</div>
            <div className="text-xs text-gray-600">Match Actions</div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-yellow-600">{stats.warnings}</div>
            <div className="text-xs text-gray-600">Warnings</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-red-600">{stats.errors}</div>
            <div className="text-xs text-gray-600">Errors</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b px-6 py-3">
        <div className="flex items-center space-x-4">
          {/* Date Filter */}
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-4 h-4 text-gray-400" />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as 'today' | 'week' | 'all')}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Action Type Filter */}
          <div className="flex items-center space-x-2">
            <FunnelIcon className="w-4 h-4 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as LogActionType | 'all')}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="match_scheduled">Match Scheduled</option>
              <option value="match_rescheduled">Match Rescheduled</option>
              <option value="match_score_entered">Score Entered</option>
              <option value="schedule_generated">Schedule Generated</option>
              <option value="schedule_published">Published</option>
              <option value="blocker_added">Blocker Added</option>
              <option value="export_generated">Export Generated</option>
            </select>
          </div>

          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as LogSeverity | 'all')}
            className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="info">Info</option>
            <option value="success">Success</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
          </select>

          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Refresh */}
          <button
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh logs"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No logs found for the selected filters</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogs.has(log.id)
              return (
                <div
                  key={log.id}
                  className={`border rounded-lg p-4 transition-all ${getSeverityBgColor(log.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Severity Icon */}
                      {getSeverityIcon(log.severity)}
                      
                      <div className="flex-1">
                        {/* Header Row */}
                        <div className="flex items-center space-x-3 mb-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getActionTypeColor(log.actionType)}`}>
                            {getActionTypeLabel(log.actionType)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(log.timestamp).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {log.user && (
                            <span className="text-xs text-gray-500">by {log.user}</span>
                          )}
                        </div>
                        
                        {/* Title */}
                        <h3 className="font-medium text-gray-900">{log.title}</h3>
                        
                        {/* Description */}
                        <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                        
                        {/* Expandable Details */}
                        {log.details && (
                          <div className="mt-2">
                            <button
                              onClick={() => toggleLogExpansion(log.id)}
                              className="flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700"
                            >
                              {isExpanded ? (
                                <ChevronDownIcon className="w-3 h-3" />
                              ) : (
                                <ChevronRightIcon className="w-3 h-3" />
                              )}
                              <span>Details</span>
                            </button>
                            
                            {isExpanded && (
                              <div className="mt-2 p-3 bg-white bg-opacity-50 rounded border border-gray-200">
                                {log.details.matchId && (
                                  <div className="text-xs">
                                    <span className="font-medium text-gray-500">Match:</span> {log.details.matchId}
                                  </div>
                                )}
                                {log.details.courtId && (
                                  <div className="text-xs">
                                    <span className="font-medium text-gray-500">Court:</span> {log.details.courtId}
                                  </div>
                                )}
                                {log.details.before && log.details.after && (
                                  <div className="mt-2 grid grid-cols-2 gap-4 text-xs">
                                    <div>
                                      <span className="font-medium text-gray-500">Before:</span>
                                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                                        {JSON.stringify(log.details.before, null, 2)}
                                      </pre>
                                    </div>
                                    <div>
                                      <span className="font-medium text-gray-500">After:</span>
                                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">
                                        {JSON.stringify(log.details.after, null, 2)}
                                      </pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default Logs