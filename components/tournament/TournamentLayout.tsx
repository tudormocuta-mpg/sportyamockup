import { ReactNode, useState, useEffect } from 'react'
import {
  CalendarIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  LockClosedIcon,
  GlobeAltIcon,
  BellIcon,
  DocumentArrowDownIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { useTournament } from '@/contexts/TournamentContext'

interface TournamentLayoutProps {
  children: ReactNode
  currentView?: string
  onViewChange?: (view: 'grid' | 'list' | 'timeline' | 'draw') => void
  selectedDate?: string
  onDateChange?: (date: string) => void
  currentTab?: 'schedule' | 'configuration' | 'blockers' | 'export' | 'notifications'
  onTabChange?: (tab: 'schedule' | 'configuration' | 'blockers' | 'export' | 'notifications') => void
  showGenerateWizard?: boolean
  onGenerateClick?: () => void
}

export default function TournamentLayout({
  children,
  currentView = 'grid',
  onViewChange = () => {},
  selectedDate = new Date().toISOString().split('T')[0],
  onDateChange = () => {},
  currentTab = 'schedule',
  onTabChange = () => {},
  showGenerateWizard = false,
  onGenerateClick = () => {},
}: TournamentLayoutProps) {
  const { state, setScheduleStatus } = useTournament()
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const activeBlockers = state.blockers.filter(b => !b.isResolved)

  const viewOptions = [
    { id: 'grid', name: 'Grid View', icon: '⊞' },
    { id: 'list', name: 'List View', icon: '☰' },
    { id: 'timeline', name: 'Timeline', icon: '⧗' },
    { id: 'draw', name: 'Draw View', icon: '⊛' },
  ]

  const mainTabs = [
    { id: 'schedule', name: 'Schedule', icon: CalendarIcon },
    { id: 'configuration', name: 'Configuration', icon: Cog6ToothIcon },
    { id: 'blockers', name: 'Blockers', icon: ExclamationTriangleIcon, badge: activeBlockers.length },
    { id: 'export', name: 'Export', icon: DocumentArrowDownIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
  ]

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Blocker Notification Bar */}
      {activeBlockers.length > 0 && (
        <div className="bg-red-500 text-white px-4 py-2 text-sm font-medium">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <span>{activeBlockers.length} scheduling conflicts detected</span>
            </div>
            <button 
              onClick={() => onTabChange('blockers')}
              className="text-red-100 hover:text-white underline">
              View & Resolve
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Title */}
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{state.name}</h1>
                <p className="text-sm text-gray-500">Tournament Scheduler</p>
              </div>
              {/* Schedule Status Badge */}
              <div className="flex items-center">
                {state.scheduleStatus === 'private' ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    <LockClosedIcon className="h-3 w-3 mr-1" />
                    Private
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                    <GlobeAltIcon className="h-3 w-3 mr-1" />
                    Public
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Undo/Redo */}
              <div className="flex items-center space-x-1 border-r border-gray-200 pr-4">
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  disabled
                  title="Undo"
                >
                  <ArrowUturnLeftIcon className="h-4 w-4" />
                </button>
                <button
                  className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  disabled
                  title="Redo"
                >
                  <ArrowUturnRightIcon className="h-4 w-4" />
                </button>
              </div>

              {/* Auto-refresh */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <ArrowPathIcon className="h-4 w-4" />
                <span>Last updated: {new Date(state.lastModified).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
              </div>
              
              {/* Publish/Unpublish Button */}
              <button
                onClick={() => setScheduleStatus(state.scheduleStatus === 'private' ? 'public' : 'private')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  state.scheduleStatus === 'private'
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {state.scheduleStatus === 'private' ? 'Publish Schedule' : 'Make Private'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {mainTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id as any)}
                  className={`flex items-center px-1 py-4 border-b-2 text-sm font-medium transition-colors relative ${
                    currentTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                  {tab.badge && tab.badge > 0 && (
                    <span className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Toolbar (only show on Schedule tab) */}
      {currentTab === 'schedule' && (
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Left side - View selector and date */}
            <div className="flex items-center space-x-6">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                {viewOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => onViewChange(option.id as any)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      currentView === option.id
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.name}
                  </button>
                ))}
              </div>

              {/* Date Selector */}
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="text-sm text-gray-600">
                  {formatDate(selectedDate)}
                </span>
              </div>
            </div>

            {/* Right side - Search and filters */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search players, matches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
              </div>

              {/* Filters */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 border rounded-md text-sm font-medium transition-colors ${
                  showFilters
                    ? 'border-blue-500 text-blue-700 bg-blue-50'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <AdjustmentsHorizontalIcon className="h-4 w-4" />
                <span>Filters</span>
              </button>

              {/* Generate Schedule */}
              <button 
                onClick={onGenerateClick}
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                Generate Schedule
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="border-t border-gray-200 py-4">
              <div className="flex flex-wrap gap-4">
                <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Draws</option>
                  {state.draws.map(draw => (
                    <option key={draw.id}>{draw.name}</option>
                  ))}
                </select>
                <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Rounds</option>
                  <option>Round 1</option>
                  <option>Round 2</option>
                  <option>Quarterfinals</option>
                  <option>Semifinals</option>
                  <option>Final</option>
                </select>
                <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Courts</option>
                  {state.courts.map(court => (
                    <option key={court.id}>{court.name}</option>
                  ))}
                </select>
                <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Status</option>
                  <option>Scheduled</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Walkover</option>
                  <option>Postponed</option>
                </select>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Clear All
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  )
}