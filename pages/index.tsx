import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>Sportya Tournament Scheduler</title>
        <meta name="description" content="Professional tournament scheduling and management platform" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Sportya Tournament Scheduler
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Professional tournament scheduling and management platform with comprehensive 
              match organization, court management, and real-time conflict detection.
            </p>
            
            <Link href="/tournament-scheduler">
              <button className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg">
                Launch Tournament Scheduler
              </button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h3m0 0h3m0 0h3l3 3v15a1 1 0 01-1 1H6a1 1 0 01-1-1v-3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Grid View Scheduling</h3>
              <p className="text-gray-600">
                Table-style scheduling interface with courts as columns and time slots as rows. 
                Drag-and-drop matches with real-time validation and conflict detection.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced List View</h3>
              <p className="text-gray-600">
                Comprehensive match listing with sortable columns, advanced filtering, 
                bulk operations, and detailed match management capabilities.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Timeline Visualization</h3>
              <p className="text-gray-600">
                Gantt-chart style timeline view with zoom controls and time range adjustment. 
                Perfect for visualizing tournament flow and resource allocation.
              </p>
            </div>
          </div>

          {/* Technical Features */}
          <div className="bg-white rounded-lg p-8 shadow-md">
            <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Technical Features
            </h3>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Tournament Management</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Comprehensive player profiles with Sportya levels</li>
                  <li>• Multi-court resource management</li>
                  <li>• Real-time match status tracking</li>
                  <li>• Court blocker management for maintenance</li>
                  <li>• Multiple draw format support</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-lg font-semibold text-gray-800 mb-3">Technical Implementation</h4>
                <ul className="space-y-2 text-gray-600">
                  <li>• Next.js 15.4.6 with TypeScript</li>
                  <li>• Tailwind CSS for responsive design</li>
                  <li>• React Context API for state management</li>
                  <li>• Comprehensive mock data for testing</li>
                  <li>• Drag-and-drop with conflict validation</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Mock Data Info */}
          <div className="mt-16 text-center">
            <div className="bg-blue-50 rounded-lg p-6 inline-block">
              <h4 className="text-lg font-semibold text-blue-900 mb-2">Demo Data Included</h4>
              <p className="text-blue-700 max-w-2xl">
                The system comes pre-loaded with 16 players, 6 courts, 20+ matches, and 9 blocker scenarios 
                to demonstrate all features and functionality in action.
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}