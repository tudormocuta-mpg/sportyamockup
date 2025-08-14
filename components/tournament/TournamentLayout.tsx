import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { ViewMode } from '../../types/tournament'
import GridView from './GridView'
import ListView from './ListView'
import TimelineView from './TimelineView'
import DrawView from './DrawView'
import MatchDetailsCard from './MatchDetailsCard'
import PlayerMatchCard from './PlayerMatchCard'
import Configuration from './Configuration'
import Blockers from './Blockers'
import Export from './Export'
import Notifications from './Notifications'
import ScheduleGenerationWizard from './ScheduleGenerationWizard'
import { CalendarDaysIcon, ChartBarIcon, ExclamationTriangleIcon, ArrowDownTrayIcon, BellIcon, Cog6ToothIcon } from '@heroicons/react/24/outline'

type MainTab = 'schedule' | 'wizard' | 'configuration' | 'blockers' | 'export' | 'notifications'

const TournamentLayout: React.FC = () => {
  const { state, setCurrentView, setSelectedDate, setSelectedMatch } = useTournament()
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('schedule')
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)

  // Main navigation tabs with icons
  const mainTabs: { id: MainTab; name: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
    { id: 'schedule', name: 'Schedule', icon: CalendarDaysIcon, color: 'blue' },
    { id: 'wizard', name: 'Schedule Wizard', icon: ChartBarIcon, color: 'purple' },
    { id: 'configuration', name: 'Configuration', icon: Cog6ToothIcon, color: 'gray' },
    { id: 'blockers', name: 'Blockers', icon: ExclamationTriangleIcon, color: 'red' },
    { id: 'export', name: 'Export', icon: ArrowDownTrayIcon, color: 'green' },
    { id: 'notifications', name: 'Notifications', icon: BellIcon, color: 'yellow' }
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
    switch (activeMainTab) {
      case 'schedule':
        return renderScheduleView()
      case 'wizard':
        return <ScheduleGenerationWizard />
      case 'configuration':
        return <Configuration />
      case 'blockers':
        return <Blockers />
      case 'export':
        return <Export />
      case 'notifications':
        return <Notifications />
      default:
        return renderScheduleView()
    }
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
      <header className="bg-white shadow-lg border-b border-gray-200 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-5"></div>
        <div className="relative px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Tournament Scheduler
              </h1>
              <p className="text-gray-600 mt-1 font-medium">Professional tournament management system</p>
            </div>
            
            {/* Date Selector */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label htmlFor="date-select" className="text-sm font-medium text-gray-700">
                  Date:
                </label>
                <select
                  id="date-select"
                  value={state.selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {availableDates.map(date => (
                    <option key={date.value} value={date.value}>
                      {date.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Enhanced Quick Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                  <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-medium">{scheduledMatches.length} Scheduled</span>
                </div>
                <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-700 font-medium">{inProgressMatches.length} In Progress</span>
                </div>
                <div className="flex items-center space-x-2 bg-gray-50 px-3 py-2 rounded-lg">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-700 font-medium">{completedMatches.length} Completed</span>
                </div>
              </div>
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
                  onClick={() => setActiveMainTab(tab.id)}
                  className={`group flex items-center space-x-2 py-3 px-4 border-b-3 font-medium text-sm transition-all duration-200 rounded-t-lg whitespace-nowrap ${
                    activeMainTab === tab.id
                      ? `border-${tab.color}-500 text-${tab.color}-700 bg-white shadow-sm`
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 transition-colors ${
                    activeMainTab === tab.id
                      ? `text-${tab.color}-600`
                      : 'text-gray-500 group-hover:text-gray-600'
                  }`} />
                  <span>{tab.name}</span>
                  {tab.id === 'blockers' && state.conflicts.length > 0 && (
                    <div className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-500 rounded-full animate-bounce">
                      {state.conflicts.length}
                    </div>
                  )}
                  {tab.id === 'notifications' && (
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
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
          <aside className="w-80 bg-white border-l border-gray-200 flex flex-col shadow-lg relative">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-50 to-purple-50">
              <h3 className="text-lg font-bold text-gray-900">
                {state.selectedMatch ? '🎾 Match Details' : '👤 Player Profile'}
              </h3>
              <button
                onClick={() => {
                  setSelectedMatch(null)
                  setSelectedPlayer(null)
                }}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors text-xl"
                title="Close"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto custom-scrollbar">
              {state.selectedMatch ? (
                <MatchDetailsCard match={state.selectedMatch} />
              ) : selectedPlayer ? (
                <PlayerMatchCard playerId={selectedPlayer} />
              ) : null}
            </div>
          </aside>
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
              <span className="font-semibold text-blue-600">{dayMatches.length}</span> matches
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