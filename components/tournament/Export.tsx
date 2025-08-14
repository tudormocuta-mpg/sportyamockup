import { useState } from 'react'
import {
  DocumentArrowDownIcon,
  CalendarIcon,
  TableCellsIcon,
  DocumentTextIcon,
  ShareIcon,
  LinkIcon,
  ClipboardDocumentIcon,
  QrCodeIcon,
  CheckIcon,
  GlobeAltIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline'
import { useTournament } from '@/contexts/TournamentContext'

type ExportFormat = 'excel' | 'pdf' | 'csv' | 'ical' | 'json'
type ExportType = 'full-schedule' | 'daily-schedule' | 'draw-schedule' | 'player-schedule'

export default function Export() {
  const { state, setScheduleStatus } = useTournament()
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf')
  const [selectedType, setSelectedType] = useState<ExportType>('full-schedule')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedDraw, setSelectedDraw] = useState(state.draws[0]?.id || '')
  const [selectedPlayer, setSelectedPlayer] = useState(state.players[0]?.id || '')
  const [includeCompleted, setIncludeCompleted] = useState(true)
  const [includeScheduled, setIncludeScheduled] = useState(true)
  const [includePlayerInfo, setIncludePlayerInfo] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [publicUrl] = useState(`https://sportya.net/tournaments/summer-2024/schedule`)

  const exportFormats = [
    {
      id: 'pdf',
      name: 'PDF Document',
      icon: DocumentTextIcon,
      description: 'Professional format for printing and sharing',
    },
    {
      id: 'excel',
      name: 'Excel Spreadsheet',
      icon: TableCellsIcon,
      description: 'Editable format with advanced sorting and filtering',
    },
    {
      id: 'csv',
      name: 'CSV File',
      icon: DocumentArrowDownIcon,
      description: 'Simple format compatible with all spreadsheet applications',
    },
    {
      id: 'ical',
      name: 'Calendar (iCal)',
      icon: CalendarIcon,
      description: 'Import directly into calendar applications',
    },
    {
      id: 'json',
      name: 'JSON Data',
      icon: DocumentArrowDownIcon,
      description: 'Raw data format for developers and integrations',
    },
  ]

  const exportTypes = [
    {
      id: 'full-schedule',
      name: 'Complete Tournament Schedule',
      description: 'All matches across all draws and dates',
    },
    {
      id: 'daily-schedule',
      name: 'Daily Schedule',
      description: 'Matches for a specific date',
    },
    {
      id: 'draw-schedule',
      name: 'Draw-Specific Schedule',
      description: 'All matches for a specific draw',
    },
    {
      id: 'player-schedule',
      name: 'Player Schedule',
      description: 'All matches for a specific player',
    },
  ]

  const handleExport = () => {
    // Simulate export process
    console.log(`Exporting ${selectedType} as ${selectedFormat}`)
    
    // Show success message
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl)
    // Could show a toast notification here
  }

  const handleGenerateQR = () => {
    // Simulate QR code generation
    console.log('Generating QR code for:', publicUrl)
  }

  const getExportPreview = () => {
    switch (selectedType) {
      case 'full-schedule':
        return `${state.matches.length} matches across ${state.draws.length} draws`
      case 'daily-schedule':
        const dailyMatches = state.matches.filter(m => m.scheduledDate === selectedDate)
        return `${dailyMatches.length} matches scheduled for ${selectedDate}`
      case 'draw-schedule':
        const drawMatches = state.matches.filter(m => m.drawId === selectedDraw)
        const drawName = state.draws.find(d => d.id === selectedDraw)?.name || 'Selected Draw'
        return `${drawMatches.length} matches in ${drawName}`
      case 'player-schedule':
        const playerMatches = state.matches.filter(m => m.player1Id === selectedPlayer || m.player2Id === selectedPlayer)
        const playerName = state.players.find(p => p.id === selectedPlayer)
        return `${playerMatches.length} matches for ${playerName?.firstName} ${playerName?.lastName}`
      default:
        return ''
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Export & Share</h2>
            <p className="text-sm text-gray-500 mt-1">
              Export schedules in various formats or share public links
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {/* Schedule Status */}
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

      {/* Public Sharing (only show if schedule is public) */}
      {state.scheduleStatus === 'public' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Public Schedule Sharing</h3>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <GlobeAltIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800">Public Schedule URL</p>
                <p className="text-xs text-green-600 mt-1">Anyone with this link can view the tournament schedule</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="text"
                value={publicUrl}
                readOnly
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-sm"
              />
              <button
                onClick={handleCopyUrl}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                <ClipboardDocumentIcon className="h-4 w-4 mr-2" />
                Copy
              </button>
              <button
                onClick={handleGenerateQR}
                className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm"
              >
                <QrCodeIcon className="h-4 w-4 mr-2" />
                QR Code
              </button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex">
                <ShareIcon className="h-5 w-5 text-blue-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Share this link with players, officials, and spectators. The schedule will update automatically as matches are completed.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Export Schedule</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Export Options */}
          <div className="space-y-6">
            {/* Export Format */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Export Format
              </label>
              <div className="space-y-3">
                {exportFormats.map((format) => {
                  const Icon = format.icon
                  return (
                    <label key={format.id} className="flex items-start cursor-pointer">
                      <input
                        type="radio"
                        value={format.id}
                        checked={selectedFormat === format.id}
                        onChange={(e) => setSelectedFormat(e.target.value as ExportFormat)}
                        className="mt-1 mr-3"
                      />
                      <div className="flex items-start">
                        <Icon className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium text-gray-900">{format.name}</span>
                          <p className="text-sm text-gray-500 mt-1">{format.description}</p>
                        </div>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Export Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                What to Export
              </label>
              <div className="space-y-2">
                {exportTypes.map((type) => (
                  <label key={type.id} className="flex items-start cursor-pointer">
                    <input
                      type="radio"
                      value={type.id}
                      checked={selectedType === type.id}
                      onChange={(e) => setSelectedType(e.target.value as ExportType)}
                      className="mt-1 mr-3"
                    />
                    <div>
                      <span className="font-medium text-gray-900">{type.name}</span>
                      <p className="text-sm text-gray-500">{type.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Conditional Fields */}
            {selectedType === 'daily-schedule' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                />
              </div>
            )}

            {selectedType === 'draw-schedule' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Draw
                </label>
                <select
                  value={selectedDraw}
                  onChange={(e) => setSelectedDraw(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  {state.draws.map(draw => (
                    <option key={draw.id} value={draw.id}>{draw.name}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedType === 'player-schedule' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Player
                </label>
                <select
                  value={selectedPlayer}
                  onChange={(e) => setSelectedPlayer(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2"
                >
                  {state.players.map(player => (
                    <option key={player.id} value={player.id}>
                      {player.firstName} {player.lastName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Right Column - Options & Preview */}
          <div className="space-y-6">
            {/* Export Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Include in Export
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeCompleted}
                    onChange={(e) => setIncludeCompleted(e.target.checked)}
                    className="mr-3"
                  />
                  <span>Completed matches</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includeScheduled}
                    onChange={(e) => setIncludeScheduled(e.target.checked)}
                    className="mr-3"
                  />
                  <span>Scheduled matches</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={includePlayerInfo}
                    onChange={(e) => setIncludePlayerInfo(e.target.checked)}
                    className="mr-3"
                  />
                  <span>Player contact information</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Export Preview</h4>
              <p className="text-sm text-gray-600 mb-3">{getExportPreview()}</p>
              
              <div className="text-xs text-gray-500 space-y-1">
                <p>Format: {exportFormats.find(f => f.id === selectedFormat)?.name}</p>
                <p>Tournament: {state.name}</p>
                <p>Generated: {new Date().toLocaleDateString()}</p>
                {state.scheduleStatus === 'private' && (
                  <p className="text-yellow-600 font-medium">⚠ Schedule is currently private</p>
                )}
              </div>
            </div>

            {/* Export Button */}
            <button
              onClick={handleExport}
              disabled={showSuccess}
              className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-green-600 disabled:cursor-not-allowed transition-colors"
            >
              {showSuccess ? (
                <>
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Export Successful!
                </>
              ) : (
                <>
                  <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                  Export Schedule
                </>
              )}
            </button>

            {showSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex">
                  <CheckIcon className="h-5 w-5 text-green-400 flex-shrink-0" />
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      Your schedule has been exported successfully. The download should start automatically.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export History */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Exports</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Complete Tournament Schedule</p>
                <p className="text-xs text-gray-500">PDF • Exported 2 hours ago</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Download Again
            </button>
          </div>
          
          <div className="flex items-center justify-between py-3 border-b border-gray-200">
            <div className="flex items-center">
              <TableCellsIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Men&apos;s Singles Draw</p>
                <p className="text-xs text-gray-500">Excel • Exported yesterday</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Download Again
            </button>
          </div>
          
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center">
              <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-900">Tournament Calendar</p>
                <p className="text-xs text-gray-500">iCal • Exported 3 days ago</p>
              </div>
            </div>
            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              Download Again
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}