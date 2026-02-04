import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { ViewMode } from '../../types/tournament'
import GridView from './GridView'
import ListView from './ListView'
import TimelineView from './TimelineView'
import DrawView from './DrawView'
import MatchDetailsCard from './MatchDetailsCard'
import PlayerDetailsCard from './PlayerDetailsCard'
import Configuration from './Configuration'
import PrePlanning from './PrePlanning'
import Blockers from './Blockers'
import Courts from './Courts'
import MatchStatusTracker from './MatchStatusTracker'
import Export from './Export'
import Notifications from './Notifications'
import Logs from './Logs'
import ScheduleGenerationWizard from './ScheduleGenerationWizard'
import { CalendarDaysIcon, ChartBarIcon, ExclamationTriangleIcon, ArrowDownTrayIcon, BellIcon, Cog6ToothIcon, MapPinIcon, ClipboardDocumentListIcon, GlobeAltIcon, LockClosedIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

type MainTab = 'schedule' | 'wizard' | 'configuration' | 'preplanning' | 'courts' | 'status' | 'blockers' | 'export' | 'notifications' | 'logs'

const TournamentLayout: React.FC = () => {
  const { state, setCurrentView, setSelectedDate, setSelectedMatch, resetSchedule, toggleScheduleStatus } = useTournament()
  
  // Check if this is a fresh tournament (no scheduled matches)
  const isFreshTournament = state.matches.every(match => !match.scheduledTime || !match.scheduledDate)
  const hasGeneratedSchedule = state.matches.some(match => match.scheduledTime && match.scheduledDate)
  
  // Start with wizard for fresh tournaments, schedule for existing ones
  const [activeMainTab, setActiveMainTab] = useState<MainTab>(isFreshTournament ? 'wizard' : 'schedule')
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  // Handle Schedule Wizard access - directly navigate since reset is handled in wizard
  const handleScheduleWizardClick = () => {
    setActiveMainTab('wizard')
  }

  // Helper function to get active tab styles with proper Tailwind classes
  const getActiveTabStyles = (color: string): string => {
    const colorMap: Record<string, string> = {
      blue: 'border-blue-500 text-blue-700 bg-white shadow-sm',
      purple: 'border-purple-500 text-purple-700 bg-white shadow-sm', 
      gray: 'border-gray-500 text-gray-700 bg-white shadow-sm',
      green: 'border-green-500 text-green-700 bg-white shadow-sm',
      orange: 'border-orange-500 text-orange-700 bg-white shadow-sm',
      red: 'border-red-500 text-red-700 bg-white shadow-sm',
      indigo: 'border-indigo-500 text-indigo-700 bg-white shadow-sm',
      yellow: 'border-yellow-500 text-yellow-700 bg-white shadow-sm',
      cyan: 'border-cyan-500 text-cyan-700 bg-white shadow-sm'
    }
    return colorMap[color] || 'border-blue-500 text-blue-700 bg-white shadow-sm'
  }

  // Helper function to get active icon styles
  const getActiveIconStyles = (color: string): string => {
    const colorMap: Record<string, string> = {
      blue: 'text-blue-600',
      purple: 'text-purple-600',
      gray: 'text-gray-600', 
      green: 'text-green-600',
      orange: 'text-orange-600',
      red: 'text-red-600',
      indigo: 'text-indigo-600',
      yellow: 'text-yellow-600',
      cyan: 'text-cyan-600'
    }
    return colorMap[color] || 'text-blue-600'
  }

  // Main navigation tabs with icons - Schedule Wizard first as primary entry point
  const mainTabs: { id: MainTab; name: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { id: 'wizard', name: 'Schedule Wizard', icon: ChartBarIcon, color: 'purple' },
    { id: 'configuration', name: 'Configuration', icon: Cog6ToothIcon, color: 'gray' },
    { id: 'preplanning', name: 'Pre-Planning', icon: GlobeAltIcon, color: 'green' },
    { id: 'schedule', name: 'Schedule', icon: CalendarDaysIcon, color: 'blue' },
    { id: 'courts', name: 'Courts', icon: MapPinIcon, color: 'green' },
    { id: 'status', name: 'Match Status', icon: ClipboardDocumentListIcon, color: 'orange' },
    { id: 'blockers', name: 'Blockers', icon: ExclamationTriangleIcon, color: 'red' },
    { id: 'export', name: 'Export', icon: ArrowDownTrayIcon, color: 'indigo' },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, color: 'yellow' },
    { id: 'logs', name: 'Logs', icon: DocumentTextIcon, color: 'cyan' }
  ]

  // Schedule view tabs
  const scheduleViews: { id: ViewMode; name: string; description: string }[] = [
    { id: 'grid', name: 'Grid View', description: 'Court-based scheduling grid' },
    { id: 'list', name: 'List View', description: 'Detailed match listing' },
    { id: 'timeline', name: 'Timeline View', description: 'Gantt-chart timeline' },
    { id: 'draw', name: 'Draw View', description: 'Isolated draw visualization' }
  ]

  // Get available dates (for demo, showing next 7 days)
  const getAvailableDates = () => {
    const dates = []
    const startDate = new Date('2024-08-15')
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        })
      })
    }
    return dates
  }

  const availableDates = getAvailableDates()

  // Render current main tab content
  const renderMainTabContent = () => {
    if (activeMainTab === 'schedule') {
      return renderScheduleView()
    }
    if (activeMainTab === 'wizard') {
      return <ScheduleGenerationWizard />
    }
    if (activeMainTab === 'configuration') {
      return <Configuration />
    }
    if (activeMainTab === 'preplanning') {
      return <PrePlanning />
    }
    if (activeMainTab === 'courts') {
      return <Courts />
    }
    if (activeMainTab === 'status') {
      return <MatchStatusTracker />
    }
    if (activeMainTab === 'blockers') {
      return <Blockers />
    }
    if (activeMainTab === 'export') {
      return <Export />
    }
    if (activeMainTab === 'notifications') {
      return <Notifications />
    }
    if (activeMainTab === 'logs') {
      return <Logs />
    }
    return renderScheduleView()
  }

  // Render current schedule view
  const renderScheduleView = () => {
    switch (state.currentView) {
      case 'grid':
        return <GridView />
      case 'list':
        return <ListView />
      case 'timeline':
        return <TimelineView />
      case 'draw':
        return <DrawView />
      default:
        return <GridView />
    }
  }

  // Get matches for selected date
  const dayMatches = state.matches.filter(match => match.scheduledDate === state.selectedDate)
  const completedMatches = dayMatches.filter(match => match.status === 'completed')
  const inProgressMatches = dayMatches.filter(match => match.status === 'in-progress')
  const scheduledMatches = dayMatches.filter(match => match.status === 'scheduled')

  return (
    <div className="tournament-layout h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SportyaOS Tournament Scheduler
              </h1>
              <p className="text-gray-600 mt-1 font-medium">
                Professional tournament management system
                <span className="mx-2">—</span>
                <span className="text-gray-400 text-sm">Version: {process.env.BUILD_TIMESTAMP}</span>
              </p>
            </div>
            
            {/* Publish Button */}
            <div className="flex items-center space-x-4">
              {state.lastPublishedAt && state.scheduleStatus === 'published' && (
                <div className="text-sm text-gray-600">
                  Published at {new Date(state.lastPublishedAt).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}, {new Date(state.lastPublishedAt).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              )}
              
              <button
                onClick={toggleScheduleStatus}
                disabled={!hasGeneratedSchedule}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  !hasGeneratedSchedule
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : state.scheduleStatus === 'published'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-amber-600 text-white hover:bg-amber-700'
                }`}
                title={!hasGeneratedSchedule ? 'Complete the wizard first to publish the schedule' : ''}
              >
                {state.scheduleStatus === 'published' ? (
                  <>
                    <LockClosedIcon className="w-4 h-4" />
                    <span>Set to Private</span>
                  </>
                ) : (
                  <>
                    <GlobeAltIcon className="w-4 h-4" />
                    <span>Publish</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Main Tab Navigation */}
        <div className="border-b border-gray-200 bg-gray-50">
          <nav className="px-6 -mb-px flex space-x-2 overflow-x-auto">
            {mainTabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.id === 'wizard') {
                      handleScheduleWizardClick()
                    } else {
                      setActiveMainTab(tab.id)
                    }
                  }}
                  className={`group flex items-center space-x-2 py-3 px-4 border-b-3 font-medium text-sm transition-all duration-200 rounded-t-lg whitespace-nowrap ${
                    activeMainTab === tab.id
                      ? getActiveTabStyles(tab.color)
                      : tab.id === 'wizard' && isFreshTournament
                      ? 'border-transparent text-purple-700 bg-purple-50 hover:bg-purple-100 animate-pulse'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${
                    activeMainTab === tab.id
                      ? getActiveIconStyles(tab.color)
                      : 'text-gray-500 group-hover:text-gray-600'
                  }`} />
                  <span>
                    {tab.id === 'wizard' && isFreshTournament ? 'Start Here →' : tab.name}
                  </span>
                  {tab.id === 'blockers' && state.conflicts.length > 0 && (
                    <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-bounce">
                      {state.conflicts.length}
                    </div>
                  )}
                  {tab.id === 'notifications' && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  )}
                  {tab.id === 'logs' && state.logs.length > 0 && (
                    <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-cyan-600 bg-cyan-100 rounded-full">
                      {state.logs.length}
                    </div>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Enhanced Schedule View Sub-Navigation */}
        {activeMainTab === 'schedule' && (
          <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
            <nav className="px-6 -mb-px flex space-x-4 overflow-x-auto">
              {scheduleViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setCurrentView(view.id)}
                  className={`group py-3 px-4 border-b-2 font-medium text-xs transition-all duration-200 rounded-t-md whitespace-nowrap ${
                    state.currentView === view.id
                      ? 'border-blue-500 text-blue-700 bg-white shadow-sm'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-white/50'
                  }`}
                >
                  <div className="font-semibold">{view.name}</div>
                  <div className={`text-xs font-normal mt-1 transition-colors ${
                    state.currentView === view.id
                      ? 'text-blue-500'
                      : 'text-gray-500 group-hover:text-gray-600'
                  }`}>
                    {view.description}
                  </div>
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Primary View */}
        <main className="flex-1 overflow-hidden custom-scrollbar">
          <div className="h-full">
            {renderMainTabContent()}
          </div>
        </main>

        {/* Enhanced Side Panel - Match Details or Player Card */}
        {(state.selectedMatch || selectedPlayer) && (
          <>
            {state.selectedMatch ? (
              <MatchDetailsCard 
                match={state.selectedMatch} 
                onClose={() => setSelectedMatch(null)}
              />
            ) : selectedPlayer ? (
              <PlayerDetailsCard 
                playerId={selectedPlayer} 
                onClose={() => setSelectedPlayer(null)}
              />
            ) : null}
          </>
        )}
      </div>

      {/* Enhanced Footer Stats */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3 shadow-inner">
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
              <CalendarDaysIcon className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-gray-700">{new Date(state.selectedDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="text-gray-600">
              <span className="font-semibold text-blue-600">{scheduledMatches.length}</span> scheduled
            </div>
            <div className="text-gray-600">
              <span className="font-semibold text-gray-600">{completedMatches.length}</span> completed
            </div>
            <div className="text-gray-600">
              <span className="font-semibold text-green-600">{state.courts.length}</span> courts
            </div>
            <div className="text-gray-600">
              <span className="font-semibold text-red-600">{state.blockers.filter(b => b.date === state.selectedDate).length}</span> blockers
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {state.conflicts.length > 0 && (
              <div className="flex items-center text-red-600 bg-red-50 px-3 py-1 rounded-full animate-pulse">
                <ExclamationTriangleIcon className="w-4 h-4 mr-1" />
                <span className="font-medium">{state.conflicts.length} conflict{state.conflicts.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            {activeMainTab === 'schedule' && state.currentView === 'grid' && (
              <div className="text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
                <span className="text-xs">
                  {state.lastRefreshTime ? (
                    `Last refresh: ${state.lastRefreshTime.toLocaleTimeString('en-US', { 
                      hour12: false, 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}`
                  ) : (
                    'Not refreshed yet'
                  )}
                </span>
              </div>
            )}
            
            <div className="text-gray-500 bg-gray-50 px-3 py-1 rounded-full">
              <span className="font-medium">
                {activeMainTab === 'schedule' 
                  ? scheduleViews.find(v => v.id === state.currentView)?.name
                  : mainTabs.find(t => t.id === activeMainTab)?.name}
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default TournamentLayout