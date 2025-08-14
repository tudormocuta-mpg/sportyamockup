import Head from 'next/head'
import ErrorBoundary from '../components/ErrorBoundary'
import TournamentLayout from '../components/tournament/TournamentLayout'

export default function TournamentScheduler() {
  return (
    <>
      <Head>
        <title>Tournament Scheduler - Sportya</title>
        <meta name="description" content="Professional tournament scheduling interface with grid, list, and timeline views" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <ErrorBoundary>
        <div className="tournament-scheduler h-screen overflow-hidden">
          <TournamentLayout />
        </div>
      </ErrorBoundary>
    </>
  )
}