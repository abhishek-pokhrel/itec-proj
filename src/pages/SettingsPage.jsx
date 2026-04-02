import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save } from 'lucide-react';
import SettingsService from '../lib/settingsService';
import { useAuth } from '../state/authContext';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';

const SettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  
  // Preferences
  const [theme, setTheme] = useState('light');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [timezone, setTimezone] = useState('UTC');
  const [defaultView, setDefaultView] = useState('kanban');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Load settings
      const settings = await SettingsService.getSettings();
      setTheme(settings.theme || 'light');
      setEmailNotifications(settings.emailNotifications ?? true);
      setPushNotifications(settings.pushNotifications ?? true);
      setReminderTime(settings.reminderTime || '09:00');
      setTimezone(settings.timezone || 'UTC');
      setDefaultView(settings.defaultView || 'kanban');
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    try {
      await SettingsService.updateSettings({
        theme,
        emailNotifications,
        pushNotifications,
        reminderTime,
        timezone,
        defaultView,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      const errorMsg = error.response?.data?.message || 'Error saving preferences';
      alert(errorMsg);
    }
  };

  const timezones = [
    'UTC',
    'EST',
    'CST',
    'MST',
    'PST',
    'GMT',
    'CET',
    'IST',
    'JST',
    'AEST',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-slate-900 to-blue-900 rounded-lg">
              <SettingsIcon size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-slate-600">Manage your account and preferences</p>
        </div>

        {/* Success Message */}
        {saved && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            ✓ Changes saved successfully
          </div>
        )}

        {/* Preferences Section */}
        <Card className="mb-6">
          <div className="border-b border-slate-200 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-slate-900 to-blue-900 rounded"></span>
              Preferences
            </h2>
          </div>

          <div className="space-y-6 mb-6">
            {/* Appearance */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Theme
              </label>
              <div className="flex gap-3">
                {['light', 'dark'].map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="theme"
                      value={t}
                      checked={theme === t}
                      onChange={(e) => setTheme(e.target.value)}
                      className="w-4 h-4 text-blue-900"
                    />
                    <span className="text-sm text-gray-700 capitalize">{t} mode</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Default View */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Default View
              </label>
              <select
                value={defaultView}
                onChange={(e) => setDefaultView(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                <option value="kanban">Kanban Board</option>
                <option value="calendar">Calendar</option>
                <option value="list">List View</option>
              </select>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
              >
                {timezones.map((tz) => (
                  <option key={tz} value={tz}>
                    {tz}
                  </option>
                ))}
              </select>
            </div>

            {/* Reminder Time */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Daily Reminder Time
              </label>
              <Input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>

            {/* Notifications */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-3">
                Notifications
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded"
                  />
                  <span className="text-sm text-gray-700">Email notifications</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="w-4 h-4 text-blue-900 rounded"
                  />
                  <span className="text-sm text-gray-700">Push notifications</span>
                </label>
              </div>
            </div>
          </div>

          <Button
            onClick={handleSavePreferences}
            className="w-full"
          >
            <Save size={16} className="mr-2" />
            Save Preferences
          </Button>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200 bg-red-50">
          <div className="border-b border-red-200 pb-4 mb-6">
            <h2 className="text-xl font-semibold text-red-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-red-700 rounded"></span>
              Danger Zone
            </h2>
          </div>
          <p className="text-sm text-red-700 mb-4">
            These actions cannot be undone.
          </p>
          <Button className="w-full bg-red-700 hover:bg-red-800 text-white">
            Delete Account
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
