import React, { useState, useMemo, useCallback } from 'react'
import {
  ExclamationTriangleIcon,
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
  gameType: 'singles' | 'doubles'
  startTime: string
  endTime: string
  date: string
  isFragment?: boolean
  parentBlockId?: string
  fragmentIndex?: number
  totalFragments?: number
}

interface CourtAvailability {
  courtId: string
  courtName: string
  surface: string
  days: {
    date: string
    dayName: string
    timeSlots: { start: string; end: string }[]
  }[]
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

// Parse "HH:MM" to total minutes
const parseTime = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

const PrePlanning: React.FC = () => {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null)
  const [draggedBlock, setDraggedBlock] = useState<Block | null>(null)
  const [dragOverDay, setDragOverDay] = useState<string | null>(null)
  const [validationMessages, setValidationMessages] = useState<ValidationMessage[]>([])
  const [simulationStatus, setSimulationStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle')

  // Match durations (from Configuration mandatory rules)
  const singlesDuration = 60 // min
  const doublesDuration = 45 // min

  // Tournament days
  const days: Day[] = useMemo(() => [
    { date: '2025-02-15', dayName: 'Sambata', dayNumber: 1 },
    { date: '2025-02-16', dayName: 'Duminica', dayNumber: 2 },
    { date: '2025-02-17', dayName: 'Luni', dayNumber: 3 }
  ], [])

  // Court availability (same structure as Configuration module)
  const courtAvailability: CourtAvailability[] = useMemo(() => [
    {
      courtId: 'court1',
      courtName: 'Teren Central',
      surface: 'Zgura',
      days: [
        {
          date: '2025-02-15',
          dayName: 'Sambata',
          timeSlots: [
            { start: '09:00', end: '12:00' },
            { start: '14:00', end: '18:00' }
          ]
        },
        {
          date: '2025-02-16',
          dayName: 'Duminica',
          timeSlots: [
            { start: '09:00', end: '12:00' },
            { start: '14:00', end: '20:00' }
          ]
        },
        {
          date: '2025-02-17',
          dayName: 'Luni',
          timeSlots: [
            { start: '09:00', end: '12:00' }
          ]
        }
      ]
    },
    {
      courtId: 'court2',
      courtName: 'Teren 2',
      surface: 'Zgura',
      days: [
        {
          date: '2025-02-15',
          dayName: 'Sambata',
          timeSlots: [
            { start: '09:00', end: '12:00' }
          ]
        },
        {
          date: '2025-02-16',
          dayName: 'Duminica',
          timeSlots: [
            { start: '09:00', end: '12:00' }
          ]
        },
        {
          date: '2025-02-17',
          dayName: 'Luni',
          timeSlots: [
            { start: '09:00', end: '12:00' }
          ]
        }
      ]
    }
  ], [])

  // Blocks state — no courtId, blocks are assigned to days
  const [blocks, setBlocks] = useState<Block[]>([
    {
      id: 'block1',
      drawId: 'draw1',
      drawName: 'Simplu N5',
      round: 1,
      roundName: 'Tur 1',
      matchCount: 8,
      gameType: 'singles',
      startTime: '09:00',
      endTime: '17:00',
      date: '2025-02-15'
    },
    {
      id: 'block2',
      drawId: 'draw2',
      drawName: 'Simplu N4',
      round: 1,
      roundName: 'Tur 1',
      matchCount: 4,
      gameType: 'singles',
      startTime: '09:00',
      endTime: '13:00',
      date: '2025-02-15'
    },
    {
      id: 'block3',
      drawId: 'draw3',
      drawName: 'Dublu N4',
      round: 1,
      roundName: 'Tur 1',
      matchCount: 4,
      gameType: 'doubles',
      startTime: '14:00',
      endTime: '17:00',
      date: '2025-02-15'
    },
    {
      id: 'block4',
      drawId: 'draw1',
      drawName: 'Simplu N5',
      round: 2,
      roundName: 'Tur 2',
      matchCount: 4,
      gameType: 'singles',
      startTime: '09:00',
      endTime: '13:00',
      date: '2025-02-16'
    },
    {
      id: 'block5',
      drawId: 'draw2',
      drawName: 'Simplu N4',
      round: 2,
      roundName: 'Tur 2',
      matchCount: 4,
      gameType: 'singles',
      startTime: '14:00',
      endTime: '18:00',
      date: '2025-02-16'
    },
    {
      id: 'block6',
      drawId: 'draw3',
      drawName: 'Dublu N4',
      round: 2,
      roundName: 'Tur 2',
      matchCount: 2,
      gameType: 'doubles',
      startTime: '09:00',
      endTime: '10:30',
      date: '2025-02-16'
    },
    {
      id: 'block7',
      drawId: 'draw1',
      drawName: 'Simplu N5',
      round: 3,
      roundName: 'Tur 3',
      matchCount: 2,
      gameType: 'singles',
      startTime: '09:00',
      endTime: '11:00',
      date: '2025-02-17'
    },
    {
      id: 'block8',
      drawId: 'draw3',
      drawName: 'Dublu N4',
      round: 3,
      roundName: 'Tur 3 (Finala)',
      matchCount: 1,
      gameType: 'doubles',
      startTime: '11:00',
      endTime: '11:45',
      date: '2025-02-17'
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

  // Calculate available slots for a given day and match duration
  const calculateDaySlots = useCallback((date: string, matchDuration: number): number => {
    let totalSlots = 0
    for (const court of courtAvailability) {
      const dayData = court.days.find(d => d.date === date)
      if (!dayData) continue
      for (const slot of dayData.timeSlots) {
        const intervalMinutes = parseTime(slot.end) - parseTime(slot.start)
        totalSlots += Math.floor(intervalMinutes / matchDuration)
      }
    }
    return totalSlots
  }, [courtAvailability])

  // Get blocks for a specific day
  const getBlocksForDay = useCallback((date: string): Block[] => {
    return blocks.filter(block => block.date === date)
  }, [blocks])

  // Count allocated matches per day by type
  const getAllocatedPerDay = useCallback((date: string) => {
    const dayBlocks = getBlocksForDay(date)
    const singles = dayBlocks
      .filter(b => b.gameType === 'singles')
      .reduce((sum, b) => sum + b.matchCount, 0)
    const doubles = dayBlocks
      .filter(b => b.gameType === 'doubles')
      .reduce((sum, b) => sum + b.matchCount, 0)
    return { singles, doubles }
  }, [getBlocksForDay])

  // Day stats (memoized)
  const dayStats = useMemo(() => {
    return days.map(day => ({
      date: day.date,
      allocated: getAllocatedPerDay(day.date),
      slotsS: calculateDaySlots(day.date, singlesDuration),
      slotsD: calculateDaySlots(day.date, doublesDuration)
    }))
  }, [days, getAllocatedPerDay, calculateDaySlots, singlesDuration, doublesDuration])

  // Drag & drop handlers — day-to-day movement
  const handleDragStart = (e: React.DragEvent, block: Block) => {
    setDraggedBlock(block)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, date: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDay(date)
  }

  const handleDragLeave = () => {
    setDragOverDay(null)
  }

  const handleDrop = (e: React.DragEvent, date: string) => {
    e.preventDefault()
    if (!draggedBlock) return

    setBlocks(prev => prev.map(block =>
      block.id === draggedBlock.id
        ? { ...block, date }
        : block
    ))

    validateSchedule()
    setDraggedBlock(null)
    setDragOverDay(null)
  }

  // Split block
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

  // Reunite fragments
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

    // Check capacity per day
    days.forEach(day => {
      const stats = dayStats.find(s => s.date === day.date)
      if (!stats) return

      if (stats.allocated.singles > stats.slotsS) {
        messages.push({
          type: 'critical',
          message: `Depasire capacitate simplu in ${day.dayName}`,
          details: `${stats.allocated.singles} meciuri alocate, doar ${stats.slotsS} sloturi disponibile`
        })
      }
      if (stats.allocated.doubles > stats.slotsD) {
        messages.push({
          type: 'critical',
          message: `Depasire capacitate dublu in ${day.dayName}`,
          details: `${stats.allocated.doubles} meciuri alocate, doar ${stats.slotsD} sloturi disponibile`
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
        if (sortedRounds[i] !== sortedRounds[i - 1] + 1) {
          const drawName = drawsInfo.find(d => d.id === drawId)?.name || drawId
          messages.push({
            type: 'warning',
            message: `Nerespectare uniformizare pentru ${drawName}`,
            details: `Turul ${sortedRounds[i - 1]} nu este complet inainte de turul ${sortedRounds[i]}`
          })
        }
      }
    })

    // Check max 2 rounds per day per draw
    const roundsPerDayPerDraw = new Map<string, Set<number>>()
    blocks.forEach(block => {
      const key = `${block.drawId}|${block.date}`
      if (!roundsPerDayPerDraw.has(key)) {
        roundsPerDayPerDraw.set(key, new Set())
      }
      roundsPerDayPerDraw.get(key)!.add(block.round)
    })

    roundsPerDayPerDraw.forEach((rounds, key) => {
      if (rounds.size > 2) {
        const [drawId, date] = key.split('|')
        const drawName = drawsInfo.find(d => d.id === drawId)?.name || drawId
        const dayName = days.find(d => d.date === date)?.dayName || date
        messages.push({
          type: 'critical',
          message: `Depasire max 2 tururi/zi`,
          details: `${drawName} are ${rounds.size} tururi programate in ${dayName}`
        })
      }
    })

    setValidationMessages(messages)
  }

  // Run simulation
  const handleRunSimulation = () => {
    setSimulationStatus('running')
    setTimeout(() => {
      validateSchedule()
      setSimulationStatus('completed')
    }, 2000)
  }

  const getBlockColor = (block: Block): string => {
    const colors: Record<string, string> = {
      draw1: 'bg-blue-100 border-blue-300 text-blue-900',
      draw2: 'bg-green-100 border-green-300 text-green-900',
      draw3: 'bg-purple-100 border-purple-300 text-purple-900',
      draw4: 'bg-orange-100 border-orange-300 text-orange-900'
    }
    return colors[block.drawId] || 'bg-gray-100 border-gray-300 text-gray-900'
  }

  const getGameTypeLabel = (type: 'singles' | 'doubles') =>
    type === 'singles' ? 'S' : 'D'

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pre-Planning</h1>
              <p className="text-sm text-gray-600 mt-1">
                Modul 2: Vizualizare consum disponibilitati si distributie blocuri pe zile
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
                    Salveaza &amp; Simuleaza
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
                  <ExclamationCircleIcon className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                ) : msg.type === 'warning' ? (
                  <ExclamationTriangleIcon className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                ) : (
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
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

        {/* Day Columns Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="grid grid-cols-3 divide-x divide-gray-200">
            {days.map((day, dayIndex) => {
              const stats = dayStats[dayIndex]
              const dayBlocks = getBlocksForDay(day.date)
              const isDropTarget = dragOverDay === day.date

              return (
                <div
                  key={day.date}
                  className={`flex flex-col min-h-[400px] transition-colors ${
                    isDropTarget ? 'bg-blue-50' : ''
                  }`}
                  onDragOver={(e) => handleDragOver(e, day.date)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, day.date)}
                >
                  {/* Day Header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 text-center">
                    <div className="text-sm font-bold text-gray-900 uppercase">
                      Ziua {day.dayNumber}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">{day.dayName}</div>
                    <div className="text-xs text-gray-500">{day.date}</div>
                  </div>

                  {/* Block Stack */}
                  <div className="flex-1 p-3 space-y-2">
                    {dayBlocks.length === 0 && (
                      <div className="h-full flex items-center justify-center text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg p-4">
                        Trage un bloc aici
                      </div>
                    )}

                    {dayBlocks.map(block => (
                      <div
                        key={block.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, block)}
                        onClick={() => setSelectedBlock(selectedBlock === block.id ? null : block.id)}
                        className={`
                          p-3 rounded-lg border-2 cursor-move transition-all
                          ${getBlockColor(block)}
                          ${selectedBlock === block.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
                          ${draggedBlock?.id === block.id ? 'opacity-50' : ''}
                          hover:shadow-md
                        `}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <div className="text-xs font-bold">
                            {block.drawName}
                          </div>
                          <div className="flex items-center space-x-1">
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              block.gameType === 'singles'
                                ? 'bg-white/60 text-gray-800'
                                : 'bg-white/60 text-gray-800'
                            }`}>
                              {getGameTypeLabel(block.gameType)}
                            </span>
                            {block.isFragment && (
                              <span className="text-xs bg-yellow-200 text-yellow-900 px-1.5 py-0.5 rounded font-medium">
                                {block.fragmentIndex}/{block.totalFragments}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-xs opacity-80">
                          {block.roundName}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {block.startTime} - {block.endTime}
                        </div>
                        <div className="text-xs font-semibold mt-1">
                          {block.matchCount} {block.matchCount === 1 ? 'meci' : 'meciuri'}
                        </div>

                        {/* Block Actions */}
                        {selectedBlock === block.id && (
                          <div className="flex space-x-1 mt-2 pt-2 border-t border-black/10">
                            {!block.isFragment && block.matchCount > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleSplitBlock(block.id)
                                }}
                                className="p-1.5 bg-white/80 rounded hover:bg-white text-xs flex items-center"
                                title="Imparte bloc"
                              >
                                <ArrowsPointingOutIcon className="w-3 h-3 mr-1" />
                                Imparte
                              </button>
                            )}
                            {block.isFragment && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleReuniteBlock(block.parentBlockId!)
                                }}
                                className="p-1.5 bg-white/80 rounded hover:bg-white text-xs flex items-center"
                                title="Reuneste fragmente"
                              >
                                <ArrowsPointingInIcon className="w-3 h-3 mr-1" />
                                Reuneste
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Day Footer — Alocate + Dispo */}
                  <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Alocate</div>
                        <div className="flex space-x-3">
                          <span className="text-blue-700 font-medium">S:{stats.allocated.singles}</span>
                          <span className="text-purple-700 font-medium">D:{stats.allocated.doubles}</span>
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-700 mb-1">Disponibil</div>
                        <div className="flex space-x-3">
                          <span className={`font-medium ${
                            stats.allocated.singles > stats.slotsS ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            S:{stats.slotsS}
                          </span>
                          <span className={`font-medium ${
                            stats.allocated.doubles > stats.slotsD ? 'text-red-600' : 'text-purple-600'
                          }`}>
                            D:{stats.slotsD}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
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
