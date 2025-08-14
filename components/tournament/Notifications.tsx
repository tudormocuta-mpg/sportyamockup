import React, { useState } from 'react'
import { useTournament } from '../../contexts/TournamentContext'

interface NotificationTemplate {
  id: string
  name: string
  type: 'match_scheduled' | 'schedule_change' | 'daily_reminder' | 'tournament_start'
  channels: ('email' | 'sms' | 'whatsapp' | 'push')[]
  subject: string
  content: string
  enabled: boolean
  timing: string
}

const Notifications: React.FC = () => {
  const { state } = useTournament()
  const [activeTab, setActiveTab] = useState<'templates' | 'settings' | 'history'>('templates')
  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: '1',
      name: 'Match Scheduled',
      type: 'match_scheduled',
      channels: ['email', 'push'],
      subject: 'Match Scheduled - {{tournament_name}}',
      content: 'Hello {{player_name}}, your match against {{opponent}} has been scheduled for {{date}} at {{time}} on {{court}}.',
      enabled: true,
      timing: 'immediate'
    },
    {
      id: '2',
      name: 'Schedule Change',
      type: 'schedule_change',
      channels: ['email', 'sms', 'push'],
      subject: 'Schedule Update - {{tournament_name}}',
      content: 'Your match has been rescheduled to {{new_date}} at {{new_time}} on {{new_court}}. Please check the updated schedule.',
      enabled: true,
      timing: 'immediate'
    },
    {
      id: '3',
      name: 'Daily Reminder',
      type: 'daily_reminder',
      channels: ['email', 'whatsapp'],
      subject: 'Tomorrow&apos;s Matches - {{tournament_name}}',
      content: 'You have {{match_count}} match(es) scheduled for tomorrow. Check the tournament app for details.',
      enabled: false,
      timing: '1 day before'
    },
    {
      id: '4',
      name: 'Tournament Start',
      type: 'tournament_start',
      channels: ['email', 'push'],
      subject: 'Tournament Starting Soon - {{tournament_name}}',
      content: 'The tournament begins in 1 hour. Make sure you&apos;re ready and arrive at the venue on time.',
      enabled: true,
      timing: '1 hour before'
    }
  ])

  const [globalSettings, setGlobalSettings] = useState({
    enableNotifications: true,
    defaultLanguage: 'en',
    timezone: 'UTC',
    batchNotifications: false,
    quietHours: {
      enabled: true,
      startTime: '22:00',
      endTime: '08:00'
    }
  })

  const [notificationHistory] = useState([
    { id: '1', type: 'match_scheduled', recipient: 'john@example.com', status: 'delivered', timestamp: '2024-08-14 10:30:00' },
    { id: '2', type: 'schedule_change', recipient: 'emma@example.com', status: 'delivered', timestamp: '2024-08-14 10:25:00' },
    { id: '3', type: 'daily_reminder', recipient: 'michael@example.com', status: 'failed', timestamp: '2024-08-14 09:00:00' },
    { id: '4', type: 'tournament_start', recipient: 'sarah@example.com', status: 'pending', timestamp: '2024-08-14 08:45:00' }
  ])

  const updateTemplate = (id: string, updates: Partial<NotificationTemplate>) => {
    setTemplates(prev => prev.map(template => 
      template.id === id ? { ...template, ...updates } : template
    ))
  }

  const toggleChannel = (templateId: string, channel: NotificationTemplate['channels'][0]) => {
    setTemplates(prev => prev.map(template => {
      if (template.id === templateId) {
        const channels = template.channels.includes(channel)
          ? template.channels.filter(c => c !== channel)
          : [...template.channels, channel]
        return { ...template, channels }
      }
      return template
    }))
  }

  const sendTestNotification = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      alert(`Test notification sent!\n\nTemplate: ${template.name}\nChannels: ${template.channels.join(', ')}\n\nNote: This is a mockup - no actual notification was sent.`)
    }
  }

  const getChannelIcon = (channel: string): string => {
    switch (channel) {
      case 'email': return '📧'
      case 'sms': return '💬'
      case 'whatsapp': return '📱'
      case 'push': return '🔔'
      default: return '📤'
    }
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'delivered': return 'text-green-600 bg-green-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="notifications-container h-full overflow-auto bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Notification Management</h2>
              <p className="text-gray-600 mt-2">Configure automated notifications for players and organizers</p>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="globalEnable"
                checked={globalSettings.enableNotifications}
                onChange={(e) => setGlobalSettings(prev => ({ ...prev, enableNotifications: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="globalEnable" className="text-sm font-medium text-gray-700">
                Enable Notifications
              </label>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'templates', name: 'Templates', count: templates.length },
                { id: 'settings', name: 'Settings', count: null },
                { id: 'history', name: 'History', count: notificationHistory.length }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                  {tab.count !== null && (
                    <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Templates Tab */}
            {activeTab === 'templates' && (
              <div className="space-y-6">
                {templates.map(template => (
                  <div key={template.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={template.enabled}
                          onChange={(e) => updateTemplate(template.id, { enabled: e.target.checked })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{template.name}</h3>
                          <p className="text-sm text-gray-600 capitalize">{template.type.replace('_', ' ')}</p>
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => sendTestNotification(template.id)}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                        >
                          Send Test
                        </button>
                      </div>
                    </div>

                    {/* Channels */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Channels</label>
                      <div className="flex flex-wrap gap-2">
                        {(['email', 'sms', 'whatsapp', 'push'] as const).map(channel => (
                          <button
                            key={channel}
                            onClick={() => toggleChannel(template.id, channel)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              template.channels.includes(channel)
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                          >
                            {getChannelIcon(channel)} {channel.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject Line</label>
                      <input
                        type="text"
                        value={template.subject}
                        onChange={(e) => updateTemplate(template.id, { subject: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Subject with {{variables}}"
                      />
                    </div>

                    {/* Content */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message Content</label>
                      <textarea
                        value={template.content}
                        onChange={(e) => updateTemplate(template.id, { content: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Message content with {{variables}}"
                      />
                    </div>

                    {/* Timing */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Send Timing</label>
                      <select
                        value={template.timing}
                        onChange={(e) => updateTemplate(template.id, { timing: e.target.value })}
                        className="px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="immediate">Immediately</option>
                        <option value="5 minutes before">5 minutes before</option>
                        <option value="1 hour before">1 hour before</option>
                        <option value="1 day before">1 day before</option>
                        <option value="custom">Custom timing</option>
                      </select>
                    </div>
                  </div>
                ))}

                {/* Available Variables */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">Available Variables</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <code>{`{{player_name}}`}</code>
                      <code>{`{{opponent}}`}</code>
                      <code>{`{{date}}`}</code>
                      <code>{`{{time}}`}</code>
                      <code>{`{{court}}`}</code>
                      <code>{`{{tournament_name}}`}</code>
                      <code>{`{{match_count}}`}</code>
                      <code>{`{{venue_name}}`}</code>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* General Settings */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Language</label>
                        <select
                          value={globalSettings.defaultLanguage}
                          onChange={(e) => setGlobalSettings(prev => ({ ...prev, defaultLanguage: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="en">English</option>
                          <option value="es">Spanish</option>
                          <option value="fr">French</option>
                          <option value="de">German</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                        <select
                          value={globalSettings.timezone}
                          onChange={(e) => setGlobalSettings(prev => ({ ...prev, timezone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="UTC">UTC</option>
                          <option value="America/New_York">Eastern Time</option>
                          <option value="America/Los_Angeles">Pacific Time</option>
                          <option value="Europe/London">London</option>
                          <option value="Europe/Paris">Paris</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="batchNotifications"
                          checked={globalSettings.batchNotifications}
                          onChange={(e) => setGlobalSettings(prev => ({ ...prev, batchNotifications: e.target.checked }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="batchNotifications" className="text-sm text-gray-700">
                          Batch similar notifications together
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Quiet Hours */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiet Hours</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="quietHours"
                          checked={globalSettings.quietHours.enabled}
                          onChange={(e) => setGlobalSettings(prev => ({ 
                            ...prev, 
                            quietHours: { ...prev.quietHours, enabled: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="quietHours" className="text-sm text-gray-700">
                          Enable quiet hours
                        </label>
                      </div>

                      {globalSettings.quietHours.enabled && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
                            <input
                              type="time"
                              value={globalSettings.quietHours.startTime}
                              onChange={(e) => setGlobalSettings(prev => ({ 
                                ...prev, 
                                quietHours: { ...prev.quietHours, startTime: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
                            <input
                              type="time"
                              value={globalSettings.quietHours.endTime}
                              onChange={(e) => setGlobalSettings(prev => ({ 
                                ...prev, 
                                quietHours: { ...prev.quietHours, endTime: e.target.value }
                              }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}

                      <div className="text-sm text-gray-600">
                        Notifications will be delayed until quiet hours end
                      </div>
                    </div>
                  </div>
                </div>

                {/* Channel Configuration */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Configuration</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { channel: 'email', name: 'Email', config: 'SMTP Server: smtp.tournament.com' },
                      { channel: 'sms', name: 'SMS', config: 'Provider: Twilio (+1234567890)' },
                      { channel: 'whatsapp', name: 'WhatsApp', config: 'Business API Connected' },
                      { channel: 'push', name: 'Push Notifications', config: 'Firebase FCM Configured' }
                    ].map(item => (
                      <div key={item.channel} className="bg-white rounded p-4 border">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getChannelIcon(item.channel)}</span>
                            <span className="font-medium text-gray-900">{item.name}</span>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full" title="Connected"></div>
                        </div>
                        <div className="text-sm text-gray-600">{item.config}</div>
                        <button className="text-sm text-blue-600 hover:text-blue-800 mt-2">
                          Configure
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Notification History</h3>
                  <div className="flex space-x-2">
                    <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                      <option>All Types</option>
                      <option>Match Scheduled</option>
                      <option>Schedule Change</option>
                      <option>Daily Reminder</option>
                    </select>
                    <select className="px-3 py-2 border border-gray-300 rounded text-sm">
                      <option>All Status</option>
                      <option>Delivered</option>
                      <option>Failed</option>
                      <option>Pending</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Recipient
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Timestamp
                        </th>
                        <th className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {notificationHistory.map(item => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.type.replace('_', ' ')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.recipient}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(item.status)}`}>
                              {item.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.timestamp}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900">
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Notifications