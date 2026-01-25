import React, { useState } from 'react'
import { 
  ClockIcon, 
  CalendarDaysIcon, 
  CogIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline'

interface MandatoryRule {
  id: string
  name: string
  defaultValue: number
  unit: string
  editable: boolean
  description: string
  value: number
}

interface PriorityRule {
  id: string
  name: string
  description: string
  effect: string
  enabled: boolean
  order: number
}

interface CourtAvailability {
  courtId: string
  courtName: string
  surface: string
  days: {
    date: string
    dayName: string
    timeSlots: {
      start: string
      end: string
    }[]
  }[]
}

interface PriorityStage {
  id: string
  title: string
  description: string
  rules: PriorityRule[]
}

const Configuration: React.FC = () => {
  const [configMode, setConfigMode] = useState<'template' | 'advanced'>('template')
  const [activeSection, setActiveSection] = useState<string>('mandatory')
  const [expandedStages, setExpandedStages] = useState<string[]>(['stage1', 'stage2', 'stage3'])
  const [draggedRule, setDraggedRule] = useState<string | null>(null)
  const [draggedStage, setDraggedStage] = useState<string | null>(null)

  // Reguli Obligatorii (4.1 din spec)
  const [mandatoryRules, setMandatoryRules] = useState<MandatoryRule[]>([
    {
      id: 'singles-duration',
      name: 'Durata meci simplu',
      defaultValue: 60,
      unit: 'min',
      editable: true,
      description: 'Timpul alocat pentru un meci de simplu',
      value: 60
    },
    {
      id: 'doubles-duration',
      name: 'Durata meci dublu',
      defaultValue: 45,
      unit: 'min',
      editable: true,
      description: 'Timpul alocat pentru un meci de dublu',
      value: 45
    },
    {
      id: 'min-rest',
      name: 'Pauza minima intre meciuri',
      defaultValue: 90,
      unit: 'min',
      editable: true,
      description: 'Pauza minima pentru acelasi jucator intre doua meciuri',
      value: 90
    },
    {
      id: 'max-matches-day',
      name: 'Maximum meciuri/zi per jucator',
      defaultValue: 3,
      unit: 'meciuri',
      editable: true,
      description: 'Numarul maxim de meciuri pe care un jucator le poate juca intr-o zi',
      value: 3
    },
    {
      id: 'max-rounds-day',
      name: 'Max. tururi (eliminatoriu) pe zi per tablou',
      defaultValue: 2,
      unit: 'tururi',
      editable: false,
      description: 'Numarul maxim de tururi dintr-un tablou eliminatoriu ce pot fi jucate intr-o zi',
      value: 2
    },
    {
      id: 'max-series-day',
      name: 'Max. serii (grupe) pe zi per tablou',
      defaultValue: 999,
      unit: 'serii',
      editable: false,
      description: 'Numarul maxim de serii din grupe ce pot fi jucate intr-o zi (practic infinit)',
      value: 999
    }
  ])

  // Disponibilitate Terenuri (4.2 din spec)
  const [courtAvailability, setCourtAvailability] = useState<CourtAvailability[]>([
    {
      courtId: 'court1',
      courtName: 'Teren Central',
      surface: 'Zgura',
      days: [
        {
          date: '2025-02-15',
          dayName: 'Sambata',
          timeSlots: [
            { start: '08:00', end: '12:00' },
            { start: '14:00', end: '20:00' }
          ]
        },
        {
          date: '2025-02-16',
          dayName: 'Duminica',
          timeSlots: [
            { start: '08:00', end: '20:00' }
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
            { start: '08:00', end: '20:00' }
          ]
        },
        {
          date: '2025-02-16',
          dayName: 'Duminica',
          timeSlots: [
            { start: '08:00', end: '18:00' }
          ]
        }
      ]
    }
  ])

  // Sistem de Priorități (4.3 din spec / Sectiunea 7.2)
  const [priorityStages, setPriorityStages] = useState<PriorityStage[]>([
    {
      id: 'stage1',
      title: 'ETAPA 1: SORTARE TABLOURI',
      description: 'Determina ordinea in care tablourile sunt procesate',
      rules: [
        {
          id: 'rule1.1',
          name: 'Numar meciuri',
          description: 'Tablourile cu mai multe meciuri au prioritate',
          effect: 'Tabloul mare ocupa sloturile primul',
          enabled: true,
          order: 1
        },
        {
          id: 'rule1.2',
          name: 'Sistem',
          description: 'Grupe > Eliminatoriu',
          effect: 'Grupele (cu serii interdependente) au prioritate',
          enabled: true,
          order: 2
        },
        {
          id: 'rule1.3',
          name: 'Nivel',
          description: 'Nivelul mai mare are prioritate. Ex: N6 > N5 > N4',
          effect: 'Tablourile avansate se programeaza primele',
          enabled: true,
          order: 3
        },
        {
          id: 'rule1.4',
          name: 'Tip',
          description: 'Simplu > Dublu',
          effect: 'Meciurile de simplu au prioritate',
          enabled: true,
          order: 4
        }
      ]
    },
    {
      id: 'stage2',
      title: 'ETAPA 2: PRIORITIZARE MECIURI',
      description: 'Determina ordinea in care meciurile dintr-un tur/serie sunt alocate pe sloturi',
      rules: [
        {
          id: 'rule2.1',
          name: 'Multi-probe',
          description: 'Jucatorii inscrisi in mai multe probe au prioritate',
          effect: 'Evita blocaje ulterioare',
          enabled: true,
          order: 1
        },
        {
          id: 'rule2.2',
          name: 'Jucatori din afara',
          description: 'Jucatorii cu resedinta in afara orasului turneului evita prima zi dimineata',
          effect: 'Timp pentru deplasare',
          enabled: true,
          order: 2
        }
      ]
    },
    {
      id: 'stage3',
      title: 'ETAPA 3: OPTIMIZARE ALOCARE',
      description: 'Ajusteaza plasarea meciurilor pentru eficienta',
      rules: [
        {
          id: 'rule3.1',
          name: 'Compactare temporala',
          description: 'Minimizeaza golurile intre meciuri pe acelasi teren',
          effect: 'Program compact',
          enabled: true,
          order: 1
        },
        {
          id: 'rule3.2',
          name: 'Minimizare fragmentare',
          description: 'Evita impartirea unui bloc pe prea multe terenuri',
          effect: 'Coerenta vizuala',
          enabled: true,
          order: 2
        },
        {
          id: 'rule3.3',
          name: 'Grupare jucator',
          description: 'Meciurile aceluiasi jucator sunt programate cat mai aproape (respectand pauza minima)',
          effect: 'Confort pentru jucator',
          enabled: true,
          order: 3
        }
      ]
    }
  ])

  const toggleStageExpanded = (stageId: string) => {
    setExpandedStages(prev => 
      prev.includes(stageId) 
        ? prev.filter(id => id !== stageId)
        : [...prev, stageId]
    )
  }

  const handleDragStart = (e: React.DragEvent, ruleId: string, stageId: string) => {
    if (configMode !== 'advanced') return
    setDraggedRule(ruleId)
    setDraggedStage(stageId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (configMode !== 'advanced') return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, targetRuleId: string, targetStageId: string) => {
    e.preventDefault()
    if (configMode !== 'advanced' || !draggedRule || !draggedStage) return
    
    // Only allow reordering within the same stage
    if (draggedStage !== targetStageId) return

    setPriorityStages(prev => {
      const newStages = [...prev]
      const stageIndex = newStages.findIndex(s => s.id === targetStageId)
      const stage = newStages[stageIndex]
      
      const draggedIndex = stage.rules.findIndex(r => r.id === draggedRule)
      const targetIndex = stage.rules.findIndex(r => r.id === targetRuleId)
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const newRules = [...stage.rules]
        const [removed] = newRules.splice(draggedIndex, 1)
        newRules.splice(targetIndex, 0, removed)
        
        // Update order numbers
        newRules.forEach((rule, index) => {
          rule.order = index + 1
        })
        
        newStages[stageIndex] = { ...stage, rules: newRules }
      }
      
      return newStages
    })

    setDraggedRule(null)
    setDraggedStage(null)
  }

  const toggleRule = (stageId: string, ruleId: string) => {
    setPriorityStages(prev => prev.map(stage => {
      if (stage.id === stageId) {
        return {
          ...stage,
          rules: stage.rules.map(rule => 
            rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
          )
        }
      }
      return stage
    }))
  }

  const updateMandatoryRule = (ruleId: string, newValue: number) => {
    setMandatoryRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, value: newValue } : rule
    ))
  }

  const addCourtTimeSlot = (courtId: string, date: string) => {
    setCourtAvailability(prev => prev.map(court => {
      if (court.courtId === courtId) {
        return {
          ...court,
          days: court.days.map(day => {
            if (day.date === date) {
              return {
                ...day,
                timeSlots: [...day.timeSlots, { start: '12:00', end: '14:00' }]
              }
            }
            return day
          })
        }
      }
      return court
    }))
  }

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Configurator Turneu</h1>
              <p className="text-sm text-gray-600 mt-1">
                Modul 1: Configurare reguli si prioritati pentru programarea automata
              </p>
            </div>
            
            {/* Template vs Advanced Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setConfigMode('template')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  configMode === 'template' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Squares2X2Icon className="w-4 h-4 inline mr-2" />
                Template
              </button>
              <button
                onClick={() => setConfigMode('advanced')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  configMode === 'advanced' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4 inline mr-2" />
                Avansat
              </button>
            </div>
          </div>

          {configMode === 'advanced' && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-800 font-medium">Mod Avansat Activ</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Puteti reordona regulile prin drag & drop si activa/dezactiva reguli individuale
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveSection('mandatory')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'mandatory'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <CogIcon className="w-4 h-4 inline mr-2" />
              Reguli Obligatorii
            </button>
            <button
              onClick={() => setActiveSection('courts')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'courts'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <CalendarDaysIcon className="w-4 h-4 inline mr-2" />
              Disponibilitate Terenuri
            </button>
            <button
              onClick={() => setActiveSection('priorities')}
              className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeSection === 'priorities'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ListBulletIcon className="w-4 h-4 inline mr-2" />
              Sistem de Prioritati
            </button>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Section 4.1: Reguli Obligatorii */}
          {activeSection === 'mandatory' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Reguli Obligatorii (Fixe)</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Parametri fundamentali pentru programarea meciurilor. Valorile implicite pot fi modificate.
                </p>

                <div className="space-y-4">
                  {mandatoryRules.map((rule) => (
                    <div key={rule.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h3 className="text-sm font-semibold text-gray-900">{rule.name}</h3>
                            {!rule.editable && (
                              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                                Fix
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1">{rule.description}</p>
                        </div>
                        
                        <div className="ml-4">
                          {rule.editable ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                value={rule.value}
                                onChange={(e) => updateMandatoryRule(rule.id, parseInt(e.target.value) || 0)}
                                className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-600">{rule.unit}</span>
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-gray-900">
                              {rule.value === 999 ? 'Infinit' : rule.value} {rule.unit}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center text-xs text-gray-500">
                        <InformationCircleIcon className="w-3 h-3 mr-1" />
                        <span>Valoare implicita: {rule.defaultValue} {rule.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section 4.2: Disponibilitate Terenuri */}
          {activeSection === 'courts' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Disponibilitate Terenuri</h2>
                <p className="text-sm text-gray-600 mb-6">
                  Definiti zilele si intervalele orare disponibile pentru fiecare teren
                </p>

                <div className="space-y-6">
                  {courtAvailability.map((court) => (
                    <div key={court.courtId} className="border border-gray-200 rounded-lg">
                      <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-semibold text-gray-900">{court.courtName}</h3>
                            <p className="text-xs text-gray-600 mt-1">Suprafata: {court.surface}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 space-y-4">
                        {court.days.map((day) => (
                          <div key={day.date} className="border-l-4 border-blue-500 pl-4">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{day.dayName}</div>
                                <div className="text-xs text-gray-600">{day.date}</div>
                              </div>
                              <button
                                onClick={() => addCourtTimeSlot(court.courtId, day.date)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                + Adauga interval
                              </button>
                            </div>
                            
                            <div className="flex flex-wrap gap-2">
                              {day.timeSlots.map((slot, index) => (
                                <div 
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 bg-blue-50 border border-blue-200 rounded-md"
                                >
                                  <ClockIcon className="w-3 h-3 text-blue-600 mr-1" />
                                  <span className="text-xs font-medium text-blue-900">
                                    {slot.start} - {slot.end}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <InformationCircleIcon className="w-5 h-5 text-amber-600 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm text-amber-900 font-medium">Nota</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Suprafata terenului este preluata automat din configurarea evenimentului.
                        Intervalele orare definite aici vor fi utilizate de algoritmul de programare.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section 4.3: Sistem de Prioritati */}
          {activeSection === 'priorities' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Sistem de Prioritati</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Personalizati comportamentul algoritmului prin reordonarea si activarea/dezactivarea regulilor
                </p>
                
                {configMode === 'template' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start">
                      <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 font-medium">Mod Template</p>
                        <p className="text-xs text-blue-600 mt-1">
                          Utilizati configuratia predefinita. Pentru a personaliza ordinea si starea regulilor, activati modul Avansat.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Priority Stages */}
              {priorityStages.map((stage) => (
                <div key={stage.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <button
                    onClick={() => toggleStageExpanded(stage.id)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors border-b border-gray-200"
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-lg mr-3 font-bold text-sm">
                        {stage.id === 'stage1' ? '1' : stage.id === 'stage2' ? '2' : '3'}
                      </div>
                      <div className="text-left">
                        <h3 className="text-sm font-semibold text-gray-900">{stage.title}</h3>
                        <p className="text-xs text-gray-600 mt-1">{stage.description}</p>
                      </div>
                    </div>
                    {expandedStages.includes(stage.id) ? (
                      <ChevronUpIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {expandedStages.includes(stage.id) && (
                    <div className="p-6">
                      <div className="space-y-3">
                        {stage.rules.map((rule) => (
                          <div
                            key={rule.id}
                            draggable={configMode === 'advanced'}
                            onDragStart={(e) => handleDragStart(e, rule.id, stage.id)}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, rule.id, stage.id)}
                            className={`
                              border rounded-lg p-4 transition-all
                              ${rule.enabled ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'}
                              ${configMode === 'advanced' ? 'cursor-move hover:shadow-md' : ''}
                              ${draggedRule === rule.id ? 'opacity-50' : ''}
                            `}
                          >
                            <div className="flex items-start">
                              {/* Drag Handle & Order */}
                              {configMode === 'advanced' && (
                                <div className="mr-3">
                                  <div className="flex flex-col items-center">
                                    <div className="text-gray-400 mb-1">
                                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M7 2a2 2 0 11-4 0 2 2 0 014 0zM7 6a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0zM15 2a2 2 0 11-4 0 2 2 0 014 0zM15 6a2 2 0 11-4 0 2 2 0 014 0zM15 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                      </svg>
                                    </div>
                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                                      {rule.order}
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Rule Content */}
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                  <h4 className={`text-sm font-semibold ${rule.enabled ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {rule.name}
                                  </h4>
                                  
                                  {/* Toggle Switch */}
                                  {configMode === 'advanced' && (
                                    <button
                                      onClick={() => toggleRule(stage.id, rule.id)}
                                      className={`
                                        relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                        ${rule.enabled ? 'bg-blue-600' : 'bg-gray-300'}
                                      `}
                                    >
                                      <span className="sr-only">Toggle rule</span>
                                      <span
                                        className={`
                                          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                          ${rule.enabled ? 'translate-x-6' : 'translate-x-1'}
                                        `}
                                      />
                                    </button>
                                  )}
                                  {configMode === 'template' && (
                                    <span className={`
                                      px-2 py-1 text-xs font-medium rounded
                                      ${rule.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}
                                    `}>
                                      {rule.enabled ? 'Activ' : 'Inactiv'}
                                    </span>
                                  )}
                                </div>
                                
                                <p className={`text-xs mb-2 ${rule.enabled ? 'text-gray-600' : 'text-gray-400'}`}>
                                  {rule.description}
                                </p>
                                
                                <div className={`flex items-center text-xs ${rule.enabled ? 'text-gray-500' : 'text-gray-400'}`}>
                                  <span className="font-medium mr-1">Efect:</span>
                                  <span>{rule.effect}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {configMode === 'advanced' && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <p className="text-xs text-gray-600">
                            <strong>Tip:</strong> Drag & drop pentru a reordona regulile in cadrul acestei etape.
                            Regulile sunt aplicate secvential, de sus in jos.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* Algorithm Flow Info */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Flux Algoritm</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">1</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Sortare Tablouri</p>
                      <p className="text-xs text-gray-600">Aplica regulile din Etapa 1 pentru a ordona tablourile</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">2</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Procesare Tururi</p>
                      <p className="text-xs text-gray-600">Pentru fiecare tur, aplica regulile din Etapa 2 si aloca meciurile</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">3</div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Optimizare</p>
                      <p className="text-xs text-gray-600">Aplica regulile din Etapa 3 pentru eficienta maxima</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Configurare Completa</h3>
              <p className="text-xs text-gray-600 mt-1">
                Salvati configuratia si continuati la modulul Pre-Planning
              </p>
            </div>
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300 transition-colors font-medium">
                Reseteaza la Default
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium">
                Salveaza & Continua →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Configuration