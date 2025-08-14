import { useState } from 'react'
import {
  BellIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  DevicePhoneMobileIcon,
  PaperAirplaneIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CheckIcon,
  XMarkIcon,
  InformationCircleIcon,
  ClockIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { useTournament } from '@/contexts/TournamentContext'
import { NotificationTemplate } from '@/types/tournament'

export default function Notifications() {
  const { state, addNotificationTemplate } = useTournament()
  const [activeTab, setActiveTab] = useState<'templates' | 'history' | 'settings'>('templates')
  const [showCreateTemplate, setShowCreateTemplate] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  // Mock notification templates
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: 'template-1',
      name: 'Match Scheduled',
      type: 'match-scheduled',
      subject: 'Your match has been scheduled',
      message: 'Hello {playerName}, your {draw} {round} match against {opponent} has been scheduled for {date} at {time} on {court}. Please arrive 15 minutes early. Good luck!',
      channels: ['email', 'sms'],
      enabled: true,
    },
    {
      id: 'template-2',
      name: 'Schedule Change Alert',
      type: 'schedule-change',
      subject: 'Important: Your match schedule has changed',
      message: 'Hi {playerName}, there has been a change to your {draw} {round} match. New details: {date} at {time} on {court}. Please update your calendar accordingly.',
      channels: ['email', 'push'],
      enabled: true,
    },
    {
      id: 'template-3',
      name: 'Daily Schedule Reminder',
      type: 'daily-reminder',
      subject: 'Tomorrow&apos;s matches - {tournamentName}',
      message: 'Hello {playerName}, you have {matchCount} match(es) scheduled for tomorrow. Check your schedule and arrive early. Tournament starts at {startTime}.',
      channels: ['email'],
      enabled: false,
    },
    {
      id: 'template-4',
      name: 'Tournament Start Notification',
      type: 'tournament-start',
      subject: 'Welcome to {tournamentName}!',
      message: 'The tournament begins today! Please check in at the registration desk by {checkinTime}. Your first match details will be sent separately. Good luck!',
      channels: ['email', 'sms', 'push'],
      enabled: true,
    },
  ])

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'match-scheduled' as const,
    subject: '',
    message: '',
    channels: ['email'] as ('email' | 'sms' | 'whatsapp' | 'push')[],
    enabled: true,
  })

  // Mock notification history
  const notificationHistory = [
    {
      id: 'hist-1',
      template: 'Match Scheduled',
      recipient: 'John Smith',
      channel: 'email',
      status: 'delivered',
      sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      id: 'hist-2',
      template: 'Schedule Change Alert',
      recipient: 'Sarah Johnson',
      channel: 'push',
      status: 'delivered',
      sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    },
    {
      id: 'hist-3',
      template: 'Match Scheduled',
      recipient: 'Mike Wilson',
      channel: 'sms',
      status: 'failed',
      sentAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    },
  ]

  const channelIcons = {
    email: EnvelopeIcon,
    sms: DevicePhoneMobileIcon,
    whatsapp: ChatBubbleLeftIcon,
    push: BellIcon,
  }

  const handleCreateTemplate = () => {
    const template: NotificationTemplate = {
      id: `template-${Date.now()}`,
      ...newTemplate,
    }
    setTemplates([...templates, template])
    setShowCreateTemplate(false)
    setNewTemplate({
      name: '',
      type: 'match-scheduled',
      subject: '',
      message: '',
      channels: ['email'],
      enabled: true,
    })
  }

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      setTemplates(templates.filter(t => t.id !== templateId))
    }
  }

  const handleToggleTemplate = (templateId: string) => {
    setTemplates(templates.map(t =>
      t.id === templateId ? { ...t, enabled: !t.enabled } : t
    ))
  }

  const handlePreviewTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template)
    setShowPreview(true)
  }

  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null

    const sampleData = {
      playerName: 'John Smith',
      opponent: 'Mike Wilson',
      draw: "Men's Singles",
      round: 'Quarterfinals',
      date: 'July 15, 2024',
      time: '3:00 PM',
      court: 'Center Court',
      tournamentName: 'Summer Championship 2024',
      matchCount: '2',
      startTime: '9:00 AM',
      checkinTime: '8:30 AM',
    }

    let previewSubject = selectedTemplate.subject
    let previewMessage = selectedTemplate.message

    // Replace placeholders with sample data
    Object.entries(sampleData).forEach(([key, value]) => {
      const placeholder = `{${key}}`
      previewSubject = previewSubject.replace(new RegExp(placeholder, 'g'), value)
      previewMessage = previewMessage.replace(new RegExp(placeholder, 'g'), value)
    })

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowPreview(false)} />
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Template Preview</h3>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-900">Email Preview</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Subject:</span>
                    <p className="font-medium">{previewSubject}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Message:</span>
                    <p className="text-gray-800 whitespace-pre-wrap">{previewMessage}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Notification Templates</h3>
        <button
          onClick={() => setShowCreateTemplate(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Template
        </button>
      </div>

      <div className="space-y-4">
        {templates.map((template) => (
          <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center">
                  <h4 className="text-lg font-semibold text-gray-900">{template.name}</h4>
                  <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    template.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {template.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 mb-3">{template.subject}</p>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div>
                    <span className="text-gray-500">Type:</span>
                    <span className="ml-2 font-medium capitalize">{template.type.replace('-', ' ')}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-500 mr-2">Channels:</span>
                    <div className="flex space-x-1">
                      {template.channels.map((channel) => {
                        const Icon = channelIcons[channel]
                        return (
                          <Icon key={channel} className="h-4 w-4 text-gray-400" title={channel} />
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handlePreviewTemplate(template)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Preview"
                >
                  <EyeIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleToggleTemplate(template.id)}
                  className={`${template.enabled ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}
                  title={template.enabled ? 'Disable' : 'Enable'}
                >
                  <CheckIcon className="h-5 w-5" />
                </button>
                <button className="text-gray-400 hover:text-gray-600" title="Edit">
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="text-red-400 hover:text-red-600"
                  title="Delete"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {templates.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BellIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No notification templates configured yet.</p>
          <button
            onClick={() => setShowCreateTemplate(true)}
            className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            Create your first template
          </button>
        </div>
      )}
    </div>
  )

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Notification History</h3>
      
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-5 text-sm font-medium text-gray-500">
            <span>Template</span>
            <span>Recipient</span>
            <span>Channel</span>
            <span>Status</span>
            <span>Sent At</span>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {notificationHistory.map((notification) => {
            const Icon = channelIcons[notification.channel as keyof typeof channelIcons]
            return (
              <div key={notification.id} className="px-6 py-4">
                <div className="grid grid-cols-5 items-center text-sm">
                  <span className="font-medium text-gray-900">{notification.template}</span>
                  <span className="text-gray-600">{notification.recipient}</span>
                  <div className="flex items-center">
                    <Icon className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="capitalize">{notification.channel}</span>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    notification.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {notification.status}
                  </span>
                  <span className="text-gray-500">
                    {notification.sentAt.toLocaleDateString()} {notification.sentAt.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      
      <div className="text-center">
        <button className="text-blue-600 hover:text-blue-800 font-medium">
          Load More History
        </button>
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
      
      <div className="space-y-6">
        {/* Global Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Global Settings</h4>
          <div className="space-y-4">
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-3" />
              <div>
                <span className="font-medium">Enable notifications</span>
                <p className="text-sm text-gray-500">Master switch for all tournament notifications</p>
              </div>
            </label>
            
            <label className="flex items-center">
              <input type="checkbox" defaultChecked className="mr-3" />
              <div>
                <span className="font-medium">Send test notifications</span>
                <p className="text-sm text-gray-500">Include tournament organizers in all notifications</p>
              </div>
            </label>
            
            <label className="flex items-center">
              <input type="checkbox" className="mr-3" />
              <div>
                <span className="font-medium">Batch notifications</span>
                <p className="text-sm text-gray-500">Group similar notifications to reduce message volume</p>
              </div>
            </label>
          </div>
        </div>

        {/* Channel Configuration */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Channel Configuration</h4>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <span className="font-medium">Email</span>
                  <p className="text-sm text-gray-500">SMTP configured and tested</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Active
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <DevicePhoneMobileIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <span className="font-medium">SMS</span>
                  <p className="text-sm text-gray-500">Twilio integration required</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Setup Required
              </span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <BellIcon className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <span className="font-medium">Push Notifications</span>
                  <p className="text-sm text-gray-500">Mobile app integration</p>
                </div>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Inactive
              </span>
            </div>
          </div>
        </div>

        {/* Timing Settings */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="font-semibold text-gray-900 mb-4">Timing Settings</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Daily reminder time
              </label>
              <input
                type="time"
                defaultValue="18:00"
                className="border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule change delay
              </label>
              <select className="border border-gray-300 rounded-md px-3 py-2">
                <option>Immediate</option>
                <option>5 minutes</option>
                <option>15 minutes</option>
                <option>30 minutes</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <p className="text-sm text-gray-500 mt-1">
              Manage notification templates, history, and delivery settings
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{templates.filter(t => t.enabled).length}</div>
              <div className="text-xs text-gray-500">Active Templates</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{notificationHistory.filter(n => n.status === 'delivered').length}</div>
              <div className="text-xs text-gray-500">Delivered Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{notificationHistory.filter(n => n.status === 'failed').length}</div>
              <div className="text-xs text-gray-500">Failed</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'templates', name: 'Templates', icon: BellIcon },
              { id: 'history', name: 'History', icon: ClockIcon },
              { id: 'settings', name: 'Settings', icon: PencilIcon },
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center px-1 py-4 border-b-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === 'templates' && renderTemplatesTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </div>

      {/* Create Template Modal */}
      {showCreateTemplate && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75" onClick={() => setShowCreateTemplate(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Notification Template</h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Template Name</label>
                    <input
                      type="text"
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="e.g., Match Reminder"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={newTemplate.type}
                      onChange={(e) => setNewTemplate({ ...newTemplate, type: e.target.value as any })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="match-scheduled">Match Scheduled</option>
                      <option value="schedule-change">Schedule Change</option>
                      <option value="daily-reminder">Daily Reminder</option>
                      <option value="tournament-start">Tournament Start</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={newTemplate.subject}
                    onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Use {playerName}, {opponent}, etc."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    value={newTemplate.message}
                    onChange={(e) => setNewTemplate({ ...newTemplate, message: e.target.value })}
                    rows={4}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Use variables like {playerName}, {date}, {time}, {court}..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Channels</label>
                  <div className="space-y-2">
                    {(['email', 'sms', 'whatsapp', 'push'] as const).map((channel) => (
                      <label key={channel} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={newTemplate.channels.includes(channel)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewTemplate({
                                ...newTemplate,
                                channels: [...newTemplate.channels, channel]
                              })
                            } else {
                              setNewTemplate({
                                ...newTemplate,
                                channels: newTemplate.channels.filter(c => c !== channel)
                              })
                            }
                          }}
                          className="mr-3"
                        />
                        <span className="capitalize">{channel}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateTemplate(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTemplate}
                  disabled={!newTemplate.name || !newTemplate.subject || !newTemplate.message}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  Create Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Preview Modal */}
      {showPreview && renderTemplatePreview()}
    </div>
  )
}