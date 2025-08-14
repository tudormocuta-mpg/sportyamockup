import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'

interface ExportOptions {
  format: 'excel' | 'pdf' | 'csv' | 'ical' | 'json'
  includePlayerDetails: boolean
  includeCourtInfo: boolean
  includeScores: boolean
  includeAvailability: boolean
  dateRange: {
    startDate: string
    endDate: string
  }
  selectedCourts: string[]
  selectedDraws: string[]
}

const Export: React.FC = () => {
  const { state } = useTournament()
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'excel',
    includePlayerDetails: true,
    includeCourtInfo: true,
    includeScores: true,
    includeAvailability: false,
    dateRange: {
      startDate: '2024-08-15',
      endDate: '2024-08-17'
    },
    selectedCourts: state.courts.map(c => c.id),
    selectedDraws: state.draws.map(d => d.id)
  })

  const [isExporting, setIsExporting] = useState(false)
  const [exportHistory, setExportHistory] = useState([
    { id: '1', format: 'pdf', timestamp: '2024-08-14 10:30:00', status: 'completed', filename: 'tournament_schedule.pdf' },
    { id: '2', format: 'excel', timestamp: '2024-08-14 09:15:00', status: 'completed', filename: 'matches_export.xlsx' },
    { id: '3', format: 'ical', timestamp: '2024-08-13 16:45:00', status: 'completed', filename: 'tournament_calendar.ics' }
  ])

  const handleExport = async () => {
    setIsExporting(true)
    
    // Simulate export process
    setTimeout(() => {
      const filename = generateFilename()
      const newExport = {
        id: Date.now().toString(),
        format: exportOptions.format,
        timestamp: new Date().toLocaleString(),
        status: 'completed' as const,
        filename
      }
      
      setExportHistory(prev => [newExport, ...prev])
      setIsExporting(false)
      
      // Show success message
      alert(`Export completed successfully!\nFile: ${filename}\n\nNote: This is a mockup - no actual file was generated.`)
    }, 2000)
  }

  const generateFilename = (): string => {
    const date = new Date().toISOString().split('T')[0]
    const formats = {
      excel: 'tournament_schedule.xlsx',
      pdf: 'tournament_schedule.pdf',
      csv: 'tournament_data.csv',
      ical: 'tournament_calendar.ics',
      json: 'tournament_data.json'
    }
    return `${date}_${formats[exportOptions.format]}`
  }

  const updateOption = (key: keyof ExportOptions, value: any) => {
    setExportOptions(prev => ({ ...prev, [key]: value }))
  }

  const handleCourtSelection = (courtId: string, selected: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      selectedCourts: selected
        ? [...prev.selectedCourts, courtId]
        : prev.selectedCourts.filter(id => id !== courtId)
    }))
  }

  const handleDrawSelection = (drawId: string, selected: boolean) => {
    setExportOptions(prev => ({
      ...prev,
      selectedDraws: selected
        ? [...prev.selectedDraws, drawId]
        : prev.selectedDraws.filter(id => id !== drawId)
    }))
  }

  const getEstimatedSize = (): string => {
    const baseSize = exportOptions.format === 'pdf' ? 2.5 : 
                    exportOptions.format === 'excel' ? 1.2 :
                    exportOptions.format === 'json' ? 0.8 : 0.3
    
    const multiplier = exportOptions.includePlayerDetails ? 1.5 : 1
    const courtMultiplier = exportOptions.selectedCourts.length / state.courts.length
    const drawMultiplier = exportOptions.selectedDraws.length / state.draws.length
    
    const estimated = baseSize * multiplier * courtMultiplier * drawMultiplier
    return `~${estimated.toFixed(1)} MB`
  }

  return (
    <div className="export-container h-full overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Export Tournament Data</h2>
              <p className="text-gray-600 mt-2">Generate reports and export tournament information in various formats</p>
            </div>
            <div className="text-right text-sm text-gray-500">
              <div>Estimated size: <span className="font-medium">{getEstimatedSize()}</span></div>
              <div>Matches: <span className="font-medium">{state.matches.length}</span></div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Export Configuration */}
          <div className="lg:col-span-2 space-y-6">
            {/* Format Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Format</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { id: 'excel', name: 'Excel Spreadsheet', desc: 'Comprehensive data with filtering', icon: '📊' },
                  { id: 'pdf', name: 'PDF Report', desc: 'Print-ready tournament schedule', icon: '📄' },
                  { id: 'csv', name: 'CSV Data', desc: 'Raw data for analysis', icon: '📋' },
                  { id: 'ical', name: 'Calendar (iCal)', desc: 'Import to calendar apps', icon: '📅' },
                  { id: 'json', name: 'JSON Data', desc: 'Structured data format', icon: '🔧' }
                ].map(format => (
                  <label key={format.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      value={format.id}
                      checked={exportOptions.format === format.id}
                      onChange={(e) => updateOption('format', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg transition-all ${
                      exportOptions.format === format.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="text-2xl mb-2">{format.icon}</div>
                      <div className="font-medium text-gray-900">{format.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{format.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={exportOptions.dateRange.startDate}
                    onChange={(e) => updateOption('dateRange', {
                      ...exportOptions.dateRange,
                      startDate: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={exportOptions.dateRange.endDate}
                    onChange={(e) => updateOption('dateRange', {
                      ...exportOptions.dateRange,
                      endDate: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Content Options */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Include in Export</h3>
              
              <div className="space-y-3">
                {[
                  { key: 'includePlayerDetails', label: 'Player Details', desc: 'Names, contact info, levels' },
                  { key: 'includeCourtInfo', label: 'Court Information', desc: 'Court names, surface types, availability' },
                  { key: 'includeScores', label: 'Match Scores', desc: 'Results and match outcomes' },
                  { key: 'includeAvailability', label: 'Player Availability', desc: 'Preferred time slots and restrictions' }
                ].map(option => (
                  <label key={option.key} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions[option.key as keyof ExportOptions] as boolean}
                      onChange={(e) => updateOption(option.key as keyof ExportOptions, e.target.checked)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Court Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Courts</h3>
              
              <div className="grid grid-cols-2 gap-3">
                {state.courts.map(court => (
                  <label key={court.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.selectedCourts.includes(court.id)}
                      onChange={(e) => handleCourtSelection(court.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{court.name}</div>
                      <div className="text-sm text-gray-600">{court.surface} • {court.indoor ? 'Indoor' : 'Outdoor'}</div>
                    </div>
                  </label>
                ))}
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => updateOption('selectedCourts', state.courts.map(c => c.id))}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Select All
                </button>
                <button
                  onClick={() => updateOption('selectedCourts', [])}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                >
                  Select None
                </button>
              </div>
            </div>

            {/* Draw Selection */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Draws</h3>
              
              <div className="space-y-3">
                {state.draws.map(draw => (
                  <label key={draw.id} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={exportOptions.selectedDraws.includes(draw.id)}
                      onChange={(e) => handleDrawSelection(draw.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-medium text-gray-900">{draw.name}</div>
                      <div className="text-sm text-gray-600">
                        {draw.format.replace('-', ' ')} • {draw.currentPlayers} players
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Export Action */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Generate Export</h3>
              
              <div className="space-y-4">
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Format: <span className="font-medium">{exportOptions.format.toUpperCase()}</span></div>
                  <div>Courts: <span className="font-medium">{exportOptions.selectedCourts.length}</span></div>
                  <div>Draws: <span className="font-medium">{exportOptions.selectedDraws.length}</span></div>
                  <div>Est. Size: <span className="font-medium">{getEstimatedSize()}</span></div>
                </div>

                <button
                  onClick={handleExport}
                  disabled={isExporting || exportOptions.selectedCourts.length === 0}
                  className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isExporting ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                      Generating...
                    </div>
                  ) : (
                    'Generate Export'
                  )}
                </button>

                <div className="text-xs text-gray-500 text-center">
                  Note: This is a mockup interface. No actual files will be generated.
                </div>
              </div>
            </div>

            {/* Quick Export Templates */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Templates</h3>
              
              <div className="space-y-2">
                {[
                  { name: 'Complete Schedule', desc: 'All matches with details', format: 'pdf' },
                  { name: 'Player List', desc: 'Contact info only', format: 'excel' },
                  { name: 'Results Report', desc: 'Completed matches', format: 'pdf' },
                  { name: 'Calendar Import', desc: 'Match times only', format: 'ical' }
                ].map(template => (
                  <button
                    key={template.name}
                    className="w-full text-left p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                    onClick={() => {
                      // Set template-specific options
                      setExportOptions(prev => ({
                        ...prev,
                        format: template.format as ExportOptions['format'],
                        includePlayerDetails: template.name === 'Player List',
                        includeScores: template.name === 'Results Report'
                      }))
                    }}
                  >
                    <div className="font-medium text-gray-900">{template.name}</div>
                    <div className="text-sm text-gray-600">{template.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Export History */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Exports</h3>
              
              <div className="space-y-3">
                {exportHistory.slice(0, 5).map(export_item => (
                  <div key={export_item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{export_item.filename}</div>
                      <div className="text-xs text-gray-600">{export_item.timestamp}</div>
                    </div>
                    <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      {export_item.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Export