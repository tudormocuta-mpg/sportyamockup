import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { TournamentProvider } from '../contexts/TournamentContext'
import ErrorBoundary from '../components/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ErrorBoundary>
      <TournamentProvider>
        <Component {...pageProps} />
      </TournamentProvider>
    </ErrorBoundary>
  )
}