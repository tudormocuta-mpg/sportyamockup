import Head from 'next/head'
import { useState } from 'react'
import TournamentLayout from '@/components/tournament/TournamentLayout'
import GridView from '@/components/tournament/GridView'
import ListView from '@/components/tournament/ListView'
import TimelineView from '@/components/tournament/TimelineView'
import DrawView from '@/components/tournament/DrawView'
import Configuration from '@/components/tournament/Configuration'
import Blockers from '@/components/tournament/Blockers'
import Export from '@/components/tournament/Export'
import Notifications from '@/components/tournament/Notifications'
import ScheduleGenerationWizard from '@/components/tournament/ScheduleGenerationWizard'

type ViewType = 'grid' | 'list' | 'timeline' | 'draw'
type TabType = 'schedule' | 'configuration' | 'blockers' | 'export' | 'notifications'

export default function TournamentScheduler() {
  const [currentView, setCurrentView] = useState<ViewType>('grid')
  const [currentTab, setCurrentTab] = useState<TabType>('schedule')
  const [selectedDate, setSelectedDate] = useState('2024-07-15') // Start with tournament date
  const [showGenerateWizard, setShowGenerateWizard] = useState(false)

  const renderScheduleView = () => {
    switch (currentView) {
      case 'grid':
        return <GridView selectedDate={selectedDate} />
      case 'list':
        return <ListView selectedDate={selectedDate} onDateChange={setSelectedDate} />
      case 'timeline':
        return <TimelineView selectedDate={selectedDate} onDateChange={setSelectedDate} />
      case 'draw':
        return <DrawView />
      default:
        return <GridView selectedDate={selectedDate} />
    }
  }

  const renderTabContent = () => {
    switch (currentTab) {
      case 'schedule':
        return renderScheduleView()
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

  return (
    <>
      <Head>
        <title>Tournament Scheduler - Sportya</title>
        <meta name="description" content="Tournament scheduling and management system" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <TournamentLayout
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        showGenerateWizard={showGenerateWizard}
        onGenerateClick={() => setShowGenerateWizard(true)}
      >
        {renderTabContent()}
      </TournamentLayout>

      {/* Schedule Generation Wizard Modal */}
      {showGenerateWizard && (
        <ScheduleGenerationWizard
          isOpen={showGenerateWizard}
          onClose={() => setShowGenerateWizard(false)}
        />
      )}
    </>
  )
}