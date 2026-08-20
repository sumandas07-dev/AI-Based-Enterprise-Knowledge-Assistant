import React, { useEffect, useState } from 'react';
import { settingsApi } from '../api/api';
import { Button } from '../components/common/Button';
import { Loader, Settings as SettingsIcon, Shield, Sliders, Bell, CheckCircle } from 'lucide-react';

export const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general'); // general, ai, notifications
  
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const data = await settingsApi.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await settingsApi.updateSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleProfileChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value
      }
    }));
  };

  const handleNotificationChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value
      }
    }));
  };

  const handleAiChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      aiPreferences: {
        ...prev.aiPreferences,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader size={20} className="animate-spin text-accent-purple" />
          <span className="text-xs text-text-secondary">Loading preferences...</span>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'general', label: 'General Info', icon: SettingsIcon },
    { id: 'ai', label: 'RAG Model Preferences', icon: Sliders },
    { id: 'security', label: 'Security & Access', icon: Shield },
  ];

  return (
    <div className="h-full w-full overflow-y-auto bg-background p-6">
      <div className="max-w-3xl mx-auto flex flex-col gap-6">
        
        {/* Header Title */}
        <div className="border-b border-border-subtle pb-5">
          <h2 className="text-base font-bold text-white">System Settings</h2>
          <p className="text-xs text-text-secondary mt-0.5 font-medium">Fine-tune system variables, profile names, and RAG configurations.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Tabs Selector List (Left Side) */}
          <div className="w-full md:w-56 shrink-0 flex flex-col gap-1 bg-panel-dark/30 border border-border-subtle p-2 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-panel-secondary text-white border-l-2 border-accent-purple'
                    : 'text-text-secondary hover:text-text-primary hover:bg-panel-secondary/30'
                }`}
              >
                <tab.icon size={14} className="shrink-0" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Form Content panel */}
          <form onSubmit={handleSave} className="flex-1 w-full bg-panel-light border border-border-subtle p-6 rounded-xl flex flex-col gap-5 shadow-lg">
            
            {activeTab === 'general' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">User Profile Summary</h3>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Full Name</label>
                  <input
                    type="text"
                    value={settings.profile.name}
                    onChange={(e) => handleProfileChange('name', e.target.value)}
                    className="px-3.5 py-2 bg-panel-dark border border-border-subtle focus:border-border-focus text-xs text-text-primary rounded-lg focus:outline-none transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Email Address</label>
                  <input
                    type="email"
                    value={settings.profile.email}
                    onChange={(e) => handleProfileChange('email', e.target.value)}
                    className="px-3.5 py-2 bg-panel-dark border border-border-subtle focus:border-border-focus text-xs text-text-primary rounded-lg focus:outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">LLM Generation Hyperparameters</h3>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">Generation LLM Model</label>
                  <select
                    value={settings.aiPreferences.model}
                    onChange={(e) => handleAiChange('model', e.target.value)}
                    className="px-3.5 py-2 bg-panel-dark border border-border-subtle focus:border-border-focus text-xs text-text-primary rounded-lg focus:outline-none transition-colors appearance-none cursor-pointer"
                  >
                    <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Default Groq Model)</option>
                    <option value="llama3-8b-8192">Llama 3 8B (Fast Inferences)</option>
                    <option value="mixtral-8x7b-32768">Mixtral 8x7B (Robust MoE)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1 mt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-text-secondary uppercase">Temperature: {settings.aiPreferences.temperature}</label>
                    <span className="text-[9px] font-semibold text-text-secondary/50 uppercase">Determines creativity/strictness</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.aiPreferences.temperature}
                    onChange={(e) => handleAiChange('temperature', parseFloat(e.target.value))}
                    className="w-full h-1 bg-panel-dark rounded-lg appearance-none cursor-pointer accent-accent-purple my-2.5"
                  />
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="flex flex-col gap-4 animate-fade-in">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Access Credentials Configuration</h3>
                <div className="text-xs text-text-secondary leading-relaxed bg-panel-dark/50 border border-border-subtle p-4 rounded-xl">
                  Authentication modules are bypassed in this visual development layout configuration (Phase 1). Direct key tokens configuration can be updated in the system `.env` file configuration list.
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between border-t border-border-subtle/50 pt-4.5 mt-2">
              <div className="flex items-center gap-2">
                {success && (
                  <span className="text-xs text-green-400 flex items-center gap-1.5 animate-fade-in font-medium">
                    <CheckCircle size={13} />
                    Settings saved successfully!
                  </span>
                )}
              </div>
              <Button type="submit" loading={saving} size="sm">
                Save Preferences
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};
