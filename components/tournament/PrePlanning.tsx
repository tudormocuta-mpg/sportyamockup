import React, { useState, useRef } from 'react'
import { 
  CalendarDaysIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon,
  ArrowPathIcon,
  PlayIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline'

interface Block {
  id: string
  drawId: string
  drawName: string
  round: number
  roundName: string
  matchCount: number
  startTime: string
  endTime: string
  courtId: string
  date: string
  isFragment?: boolean
  parentBlockId?: string
  fragmentIndex?: number
  totalFragments?: number
}

interface Court {
  id: string
  name: string
  surface: string
}

interface Day {
  date: string
  dayName: string
  dayNumber: number
}

interface DrawInfo {
  id: string
  name: string
  type: 'elimination' | 'groups'
  totalPlayers: number
  totalMatches: number
  rounds: number
  distribution: string
  groupMatches?: number
  eliminationMatches?: number
}

interface ValidationMessage {
  type: 'critical' | 'warning' | 'info'
  message: string
  details?: string
}

const PrePlanning: React.FC = () => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null)
  const [validationMessages, setValidationMessages] = useState<ValidationMessage[]>([])
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle')
  
  // Mock data - în realitate ar veni din context/API
  const days: Day[] = [
    { date: '2025-02-15', dayName: 'Sambata', dayNumber: 1 },
    { date: '2025-02-16', dayName: 'Duminica', dayNumber: 2 },
    { date: '2025-02-17', dayName: 'Luni', dayNumber: 3 }
  ]

  const courts: Court[] = [
    { id: 'court1', name: 'Teren Central', surface: 'Zgura' },
    { id: 'court2', name: 'Teren 2', surface: 'Zgura' },
    { id: 'court3', name: 'Teren 3', surface: 'Hard' }
  ]

  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 'block1',
      drawId: 'draw1',
      drawName: 'Simplu N5',
      round: 1,
      roundName: 'Tur 1',
      matchCount: 8,
      startTime: '08:00',
      endTime: '12:00',
      courtId: 'court1',
      date: '2025-02-15'
    },
    {
      id: 'block2',
      drawId: 'draw2',
      drawName: 'Simplu N4',
      round: 1,
      roundName: 'Tur 1',
      matchCount: 4,
      startTime: '14:00',
      endTime: '16:00',
      courtId: 'court1',
      date: '2025-02-15'
    },
    {
      id: 'block3',
      drawId: 'draw3',
      drawName: 'Dublu N4',
      round: 1,
      roundName: 'Tur 1',
      matchCount: 4,
      startTime: '08:00',
      endTime: '10:00',
      courtId: 'court2',
      date: '2025-02-15'
    },
    {
      id: 'block4',
      drawId: 'draw1',
      drawName: 'Simplu N5',
      round: 2,
      roundName: 'Tur 2',
      matchCount: 4,
      startTime: '08:00',
      endTime: '10:00',
      courtId: 'court1',
      date: '2025-02-16'
    },
    {
      id: 'block5-frag1',
      drawId: 'draw1',
      drawName: 'Simplu N5',
      round: 3,
      roundName: 'Tur 3',
      matchCount: 1,
      startTime: '11:00',
      endTime: '12:00',
      courtId: 'court1',
      date: '2025-02-16',
      isFragment: true,
      parentBlockId: 'block5',
      fragmentIndex: 1,
      totalFragments: 2
    },
    {
      id: 'block5-frag2',
      drawId: 'draw1',
      drawName: 'Simplu N5',
      round: 3,
      roundName: 'Tur 3',
      matchCount: 1,
      startTime: '14:00',
      endTime: '15:00',
      courtId: 'court2',
      date: '2025-02-16',
      isFragment: true,
      parentBlockId: 'block5',
      fragmentIndex: 2,
      totalFragments: 2
    }
  ])

  const drawsInfo: DrawInfo[] = [
    {
      id: 'draw1',
      name: 'Simplu N5',
      type: 'elimination',
      totalPlayers: 16,
      totalMatches: 15,
      rounds: 4,
      distribution: 'T1:8, T2:4, T3:2, T4:1'
    },
    {
      id: 'draw2',
      name: 'Simplu N4',
      type: 'elimination',
      totalPlayers: 12,
      totalMatches: 11,
      rounds: 4,
      distribution: 'T1:4+bye, T2:4, T3:2, T4:1'
    },
    {
      id: 'draw3',
      name: 'Dublu N4',
      type: 'elimination',
      totalPlayers: 8,
      totalMatches: 7,
      rounds: 3,
      distribution: 'T1:4, T2:2, T3:1'
    },
    {
      id: 'draw4',
      name: 'Simplu N3',
      type: 'groups',
      totalPlayers: 9,
      totalMatches: 12,
      rounds: 0,
      distribution: '',
      groupMatches: 9,
      eliminationMatches: 3
    }
  ]

  // Calculate total matches per day
  const getMatchesPerDay = (date: string): number => {
    return blocks
      .filter(block => block.date === date)
      .reduce((sum, block) => sum + block.matchCount, 0)
  }

  // Get blocks for a specific court and date
  const getBlocksForCourtAndDay = (courtId: string, date: string): Block[] => {
    return blocks.filter(block => block.courtId === courtId && block.date === date)
  }

  // Handle block drag start
  const handleDragStart = (e: React.DragEvent, block: Block) => {
    setDraggedBlock(block)
    e.dataTransfer.effectAllowed = 'move'
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, courtId: string, date: string) => {
    e.preventDefault()
    if (!draggedBlock) return

    // Move block to new position
    setBlocks(prev => prev.map(block => 
      block.id === draggedBlock.id
        ? { ...block, courtId, date }
        : block
    ))

    // Validate after move
    validateSchedule()
    setDraggedBlock(null)
  }

  // Split block across multiple courts
  const handleSplitBlock = (blockId: string) => {
    const block = blocks.find(b => b.id === blockId)
    if (!block || block.matchCount < 2) return

    const halfMatches = Math.floor(block.matchCount / 2)
    const newBlocks: Block[] = [
      {
        ...block,
        id: `${blockId}-frag1`,
        matchCount: halfMatches,
        isFragment: true,
        parentBlockId: blockId,
        fragmentIndex: 1,
        totalFragments: 2
      },
      {
        ...block,
        id: `${blockId}-frag2`,
        matchCount: block.matchCount - halfMatches,
        courtId: courts[1]?.id || block.courtId,
        isFragment: true,
        parentBlockId: blockId,
        fragmentIndex: 2,
        totalFragments: 2
      }
    ]

    setBlocks(prev => [
      ...prev.filter(b => b.id !== blockId),
      ...newBlocks
    ])
  }

  // Reunite block fragments
  const handleReuniteBlock = (parentBlockId: string) => {
    const fragments = blocks.filter(b => b.parentBlockId === parentBlockId)
    if (fragments.length < 2) return

    const totalMatches = fragments.reduce((sum, f) => sum + f.matchCount, 0)
    const firstFragment = fragments[0]

    const reunitedBlock: Block = {
      ...firstFragment,
      id: parentBlockId,
      matchCount: totalMatches,
      isFragment: false,
      parentBlockId: undefined,
      fragmentIndex: undefined,
      totalFragments: undefined
    }

    setBlocks(prev => [
      ...prev.filter(b => b.parentBlockId !== parentBlockId),
      reunitedBlock
    ])
  }

  // Validate schedule
  const validateSchedule = () => {
    const messages: ValidationMessage[] = []

    // Check capacity
    blocks.forEach(block => {
      const dayBlocks = getBlocksForCourtAndDay(block.courtId, block.date)
      const totalHours = dayBlocks.reduce((sum, b) => {
        const start = parseInt(b.startTime.split(':')[0])
        const end = parseInt(b.endTime.split(':')[0])
        return sum + (end - start)
      }, 0)

      if (totalHours > 12) {
        messages.push({
          type: 'critical',
          message: `Depasire capacitate pe ${block.courtId} in ${block.date}`,
          details: `Total ${totalHours} ore programate (maxim 12)`
        })
      }
    })

    // Check uniformity rule
    const drawRounds = new Map<string, Set<number>>()
    blocks.forEach(block => {
      if (!drawRounds.has(block.drawId)) {
        drawRounds.set(block.drawId, new Set())
      }
      drawRounds.get(block.drawId)!.add(block.round)
    })

    drawRounds.forEach((rounds, drawId) => {
      const sortedRounds = Array.from(rounds).sort()
      for (let i = 1; i < sortedRounds.length; i++) {
        if (sortedRounds[i] !== sortedRounds[i-1] + 1) {
          messages.push({
            type: 'warning',
            message: `Nerespectare uniformizare pentru ${drawId}`,
            details: `Turul ${sortedRounds[i-1]} nu este complet inainte de turul ${sortedRounds[i]}`
          })
        }
      }
    })

    // Check max 2 rounds per day per draw
    const roundsPerDayPerDraw = new Map<string, number>()
    blocks.forEach(block => {
      const key = `${block.drawId}-${block.date}`
      const currentRounds = roundsPerDayPerDraw.get(key) || 0
      roundsPerDayPerDraw.set(key, Math.max(currentRounds, block.round))
    })

    roundsPerDayPerDraw.forEach((maxRound, key) => {
      if (maxRound > 2) {
        const [drawId, date] = key.split('-')
        messages.push({
          type: 'critical',
          message: `Depasire max 2 tururi/zi`,
          details: `${drawId} are ${maxRound} tururi programate in ${date}`
        })
      }
    })

    setValidationMessages(messages)
  }

  // Run simulation
  const handleRunSimulation = () => {
    setSimulationStatus('running')
    
    // Simulate processing
    setTimeout(() => {
      validateSchedule()
      setSimulationStatus('completed')
    }, 2000)
  }

  const getBlockColor = (block: Block): string => {
    const colors = {
      draw1: 'bg-blue-100 border-blue-300',
      draw2: 'bg-green-100 border-green-300',
      draw3: 'bg-purple-100 border-purple-300',
      draw4: 'bg-orange-100 border-orange-300'
    }
    return colors[block.drawId as keyof typeof colors] || 'bg-gray-100 border-gray-300'
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pre-Planning</h1>
              <p className="text-sm text-gray-600 mt-1">
                Modul 2: Programare efectiva si afisare blocuri
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRunSimulation}
                disabled={simulationStatus === 'running'}
                className={`px-4 py-2 text-sm font-medium rounded-lg flex items-center ${
                  simulationStatus === 'running'
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                } transition-colors`}
              >
                {simulationStatus === 'running' ? (
                  <>
                    <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                    Simulare in curs...
                  </>
                ) : (
                  <>
                    <PlayIcon className="w-4 h-4 mr-2" />
                    Salveaza & Simuleaza
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Validation Messages */}
        {validationMessages.length > 0 && (
          <div className="mb-6 space-y-3">
            {validationMessages.map((msg, index) => (
              <div
                key={index}
                className={`rounded-lg p-4 flex items-start ${
                  msg.type === 'critical' 
                    ? 'bg-red-50 border border-red-200'
                    : msg.type === 'warning'
                    ? 'bg-amber-50 border border-amber-200'
                    : 'bg-blue-50 border border-blue-200'
                }`}
              >
                {msg.type === 'critical' ? (
                  <ExclamationCircleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5" />
                ) : msg.type === 'warning' ? (
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mr-3 mt-0.5" />
                ) : (
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
                )}
                <div>
                  <p className={`text-sm font-medium ${
                    msg.type === 'critical' 
                      ? 'text-red-900'
                      : msg.type === 'warning'
                      ? 'text-amber-900'
                      : 'text-blue-900'
                  }`}>
                    {msg.message}
                  </p>
                  {msg.details && (
                    <p className={`text-xs mt-1 ${
                      msg.type === 'critical' 
                        ? 'text-red-700'
                        : msg.type === 'warning'
                        ? 'text-amber-700'
                        : 'text-blue-700'
                    }`}>
                      {msg.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Planning Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Terenuri
                  </th>
                  {days.map(day => (
                    <th key={day.date} className="px-4 py-3 text-center border-l border-gray-200">
                      <div className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        Ziua {day.dayNumber}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">{day.dayName}</div>
                      <div className="text-xs text-gray-500">{day.date}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {courts.map(court => (
                  <tr key={court.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{court.name}</div>
                      <div className="text-xs text-gray-500">{court.surface}</div>
                    </td>
                    {days.map(day => (
                      <td 
                        key={`${court.id}-${day.date}`}
                        className="px-4 py-4 border-l border-gray-200 align-top min-h-[120px]"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, court.id, day.date)}
                      >
                        <div className="space-y-2">
                          {getBlocksForCourtAndDay(court.id, day.date).map(block => (
                            <div
                              key={block.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, block)}
                              onClick={() => setSelectedBlock(block.id)}
                              className={`
                                p-3 rounded-lg border-2 cursor-move transition-all
                                ${getBlockColor(block)}
                                ${selectedBlock === block.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                                ${draggedBlock?.id === block.id ? 'opacity-50' : ''}
                                hover:shadow-md
                              `}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <div className="text-xs font-semibold text-gray-900">
                                  {block.drawName}
                                </div>
                                {block.isFragment && (
                                  <span className="text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                                    {block.fragmentIndex}/{block.totalFragments}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-700">
                                {block.roundName}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {block.startTime} - {block.endTime}
                              </div>
                              <div className="text-xs font-medium text-gray-800 mt-1">
                                {block.matchCount} {block.matchCount === 1 ? 'meci' : 'meciuri'}
                              </div>
                              
                              {/* Block Actions */}
                              {selectedBlock === block.id && (
                                <div className="flex space-x-1 mt-2">
                                  {!block.isFragment && block.matchCount > 1 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleSplitBlock(block.id)
                                      }}
                                      className="p-1 bg-white rounded hover:bg-gray-100"
                                      title="Imparte bloc"
                                    >
                                      <ArrowsPointingOutIcon className="w-3 h-3 text-gray-600" />
                                    </button>
                                  )}
                                  {block.isFragment && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleReuniteBlock(block.parentBlockId!)
                                      }}
                                      className="p-1 bg-white rounded hover:bg-gray-100"
                                      title="Reuneste fragmente"
                                    >
                                      <ArrowsPointingInIcon className="w-3 h-3 text-gray-600" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
                
                {/* Total Matches Row */}
                <tr className="bg-gray-100 font-semibold">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    TOTAL MECIURI
                  </td>
                  {days.map(day => (
                    <td key={day.date} className="px-4 py-3 text-center text-sm text-gray-900 border-l border-gray-200">
                      {getMatchesPerDay(day.date)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tournament Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Informatii Tablouri</h2>
          
          <div className="space-y-4">
            {/* Elimination Draws */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Tablouri Eliminatorii</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tablou</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jucatori</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Meciuri</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tururi</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Distributie Meciuri</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {drawsInfo.filter(d => d.type === 'elimination').map(draw => (
                      <tr key={draw.id}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{draw.name}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{draw.totalPlayers}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{draw.totalMatches}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{draw.rounds}</td>
                        <td className="px-4 py-2 text-sm text-gray-600">{draw.distribution}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Group Draws */}
            {drawsInfo.filter(d => d.type === 'groups').length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Tablouri pe Grupe</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tablou</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jucatori</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total Meciuri</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Meciuri Grupe</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Meciuri Elimin.</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {drawsInfo.filter(d => d.type === 'groups').map(draw => (
                        <tr key={draw.id}>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">{draw.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{draw.totalPlayers} (3x3)</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{draw.totalMatches}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{draw.groupMatches}</td>
                          <td className="px-4 py-2 text-sm text-gray-600">{draw.eliminationMatches}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Actiuni Pre-Planning</h3>
              <p className="text-xs text-gray-600 mt-1">
                Salvati planificarea si continuati la vizualizarea detaliata
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors font-medium">
                ← Inapoi la Configurator
              </button>
              <button 
                disabled={validationMessages.some(m => m.type === 'critical')}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
                  validationMessages.some(m => m.type === 'critical')
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Continua la Vizualizare →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrePlanning