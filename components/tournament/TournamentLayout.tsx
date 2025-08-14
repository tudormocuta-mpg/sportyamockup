import React from 'react'
import { useTournament } from '../../contexts/TournamentContext'
import { ViewMode } from '../../types/tournament'
import GridView from './GridView'
import ListView from './ListView'
import TimelineView from './TimelineView'
import MatchDetailsCard from './MatchDetailsCard'

const TournamentLayout: React.FC = () => {
  const { state, setCurrentView, setSelectedDate, setSelectedMatch } = useTournament()

  // Tab configuration
  const tabs: { id: ViewMode; name: string; description: string }[] = [
    { id: 'grid', name: 'Grid View', description: 'Court-based scheduling grid' },
    { id: 'list', name: 'List View', description: 'Detailed match listing' },
    { id: 'timeline', name: 'Timeline View', description: 'Gantt-chart timeline' }
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

  // Render current view
  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'grid':
        return <GridView />
      case 'list':
        return <ListView />
      case 'timeline':
        return <TimelineView />
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
    <div className="tournament-layout h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tournament Scheduler</h1>
              <p className="text-gray-600 mt-1">Manage matches, courts, and scheduling</p>
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

              {/* Quick Stats */}
              <div className="hidden md:flex items-center space-x-6 text-sm">
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">{scheduledMatches.length} Scheduled</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">{inProgressMatches.length} In Progress</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-600">{completedMatches.length} Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="px-6 -mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  state.currentView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div>{tab.name}</div>
                <div className="text-xs text-gray-400 font-normal mt-1">
                  {tab.description}
                </div>
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Primary View */}
        <main className="flex-1 overflow-hidden">
          {renderCurrentView()}
        </main>

        {/* Side Panel - Match Details */}
        {state.selectedMatch && (
          <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Match Details</h3>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-gray-400 hover:text-gray-600 text-xl"
                title="Close"
              >
                ×
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <MatchDetailsCard match={state.selectedMatch} />
            </div>
          </aside>
        )}
      </div>

      {/* Footer Stats */}
      <footer className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <div>
            <span className="font-medium">{state.selectedDate}</span>
            <span className="mx-2">•</span>
            <span>{dayMatches.length} matches</span>
            <span className="mx-2">•</span>
            <span>{state.courts.length} courts</span>
            <span className="mx-2">•</span>
            <span>{state.blockers.filter(b => b.date === state.selectedDate).length} blockers</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {state.conflicts.length > 0 && (
              <div className="flex items-center text-red-600">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                <span>{state.conflicts.length} conflict{state.conflicts.length !== 1 ? 's' : ''}</span>
              </div>
            )}
            
            <div className="text-gray-500">
              View: {tabs.find(t => t.id === state.currentView)?.name}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default TournamentLayout