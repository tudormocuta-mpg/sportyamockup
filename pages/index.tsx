import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>Sportya - Clean Slate</title>
        <meta name="description" content="Fresh start with Tailwind CSS" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-4xl mx-auto text-center p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to Sportya
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Clean slate ready - let&apos;s build something amazing with Tailwind CSS!
          </p>
          
          <div className="space-y-4">
            <div className="card p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                🚀 Ready to Start
              </h2>
              <p className="text-gray-600">
                Project reset complete. We have a fresh Next.js setup with Tailwind CSS ready for mockups.
              </p>
            </div>
            
            <div className="flex justify-center space-x-4 mt-6">
              <Link href="/tournament-scheduler" className="btn-primary">
                Open Tournament Scheduler
              </Link>
              <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors">
                View Docs
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}