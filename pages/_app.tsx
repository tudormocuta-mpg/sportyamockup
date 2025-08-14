import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { TournamentProvider } from '../contexts/TournamentContext'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TournamentProvider>
      <Component {...pageProps} />
    </TournamentProvider>
  )
}