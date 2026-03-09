import React, { useState } from 'react';
import { UserData, Language } from '../types';
import { COUNTRIES } from '../constants';
import { COUNTRY_CODES } from '../countryCodes';
import { Settings, X, ChevronDown, ArrowLeft, Bell, User, Heart, Calendar, Clock, Send, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { LEGAL_CONTENT } from '../constants/legal';
import { translations } from '../translations';
import { NotificationService } from '../services/notificationService';

// Helper to convert ISO country code to emoji flag
const getFlagEmoji = (countryName: string) => {
  const code = COUNTRY_CODES[countryName];
  if (!code || code === 'UN') return '🌐';
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

const LANGUAGES: { code: Language; name: string; flag: string }[] = [
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
];

interface SettingsViewProps {
  userData: UserData;
  onSave: (data: UserData) => void;
  onClose: () => void;
  onPreviewBirthday?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ userData, onSave, onClose, onPreviewBirthday }) => {
  const [formData, setFormData] = useState<UserData>({
    ...userData,
    notifications: userData.notifications || {
      enabled: false,
      dailyTime: '09:00',
      includeLifeRemaining: true,
      monthlyUpdate: true,
      birthdayMessage: true
    }
  });
  const [activeTab, setActiveTab] = useState<'general' | 'notifications'>('general');
  const [legalView, setLegalView] = useState<'privacy' | 'terms' | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'sending' | 'success' | 'error' | 'denied'>('idle');
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isIframe, setIsIframe] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  React.useEffect(() => {
    setIsIframe(window.self !== window.top);
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone);
    
    if (!('Notification' in window)) {
      setBrowserPermission('unsupported');
    } else {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const t = translations[formData.language || 'ja'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
    >
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <AnimatePresence mode="wait">
          {legalView ? (
            <motion.div
              key="legal"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-col h-full"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center gap-4" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)' }}>
                <button 
                  onClick={() => setLegalView(null)}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-bold tracking-tight">{LEGAL_CONTENT[legalView].title}</h2>
              </div>
              <div className="p-6 overflow-y-auto text-sm text-zinc-400 leading-relaxed font-sans">
                <pre className="whitespace-pre-wrap font-sans">
                  {LEGAL_CONTENT[legalView].content}
                </pre>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="settings"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col h-full"
            >
              <div className="p-6 border-b border-zinc-800 flex items-center justify-between" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)' }}>
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-zinc-400" />
                  <h2 className="text-xl font-bold tracking-tight uppercase">{t.settings}</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex border-b border-zinc-800">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'general' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <User className="w-4 h-4" />
                  {t.general}
                </button>
                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === 'notifications' ? 'text-white border-b-2 border-white' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Bell className="w-4 h-4" />
                  {t.notifications}
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
                {activeTab === 'general' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{t.birthDate}</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <input
                          type="date"
                          required
                          value={formData.birthDate}
                          onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{t.gender}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['male', 'female'] as const).map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => setFormData({ ...formData, gender: g })}
                            className={`py-2 rounded-lg border transition-all ${
                              formData.gender === g 
                                ? 'bg-white text-black border-white font-bold' 
                                : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                            }`}
                          >
                            {t[g]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{t.country}</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-xl">
                          {getFlagEmoji(formData.country)}
                        </div>
                        <select
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-12 pr-10 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none cursor-pointer"
                        >
                          {COUNTRIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{t.language}</label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-xl">
                          {LANGUAGES.find(l => l.code === formData.language)?.flag || '🌐'}
                        </div>
                        <select
                          value={formData.language}
                          onChange={(e) => setFormData({ ...formData, language: e.target.value as Language })}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-12 pr-10 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none cursor-pointer"
                        >
                          {LANGUAGES.map((l) => (
                            <option key={l.code} value={l.code}>
                              {l.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div 
                      className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-xl border border-zinc-800 cursor-pointer hover:bg-zinc-800 transition-colors"
                      onClick={async () => {
                        const currentEnabled = formData.notifications?.enabled;
                        const newEnabled = !currentEnabled;
                        
                        // Update UI immediately for better responsiveness
                        setFormData(prev => ({
                          ...prev,
                          notifications: {
                            ...(prev.notifications || {
                              dailyTime: '09:00',
                              includeLifeRemaining: true,
                              monthlyUpdate: true,
                              birthdayMessage: true
                            }),
                            enabled: newEnabled
                          }
                        }));

                        if (newEnabled) {
                          try {
                            const granted = await NotificationService.requestPermissions();
                            if (!granted) {
                              console.warn('Notification permission was not granted');
                            }
                            // Re-check browser permission state
                            if ('Notification' in window) {
                              setBrowserPermission(Notification.permission);
                            }
                          } catch (err) {
                            console.error('Error requesting permissions:', err);
                          }
                        }
                      }}
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm font-bold text-white">{t.enableNotifications}</div>
                      </div>
                      <div
                        className={`w-12 h-6 rounded-full transition-all relative ${
                          formData.notifications?.enabled ? 'bg-white' : 'bg-zinc-700'
                        }`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
                          formData.notifications?.enabled ? 'right-1 bg-black' : 'left-1 bg-zinc-400'
                        }`} />
                      </div>
                    </div>

                    {formData.notifications?.enabled && (browserPermission === 'denied' || browserPermission === 'default' || browserPermission === 'unsupported') && (
                      <div className={`p-3 border rounded-xl text-[10px] leading-relaxed space-y-2 ${
                        browserPermission === 'denied' || browserPermission === 'unsupported' ? 'bg-red-900/10 border-red-500/20 text-red-400' : 'bg-zinc-800/50 border-zinc-700 text-zinc-400'
                      }`}>
                        <div className="flex items-start gap-2">
                          {browserPermission === 'denied' ? (
                            <><span>⚠️</span> <span>{t.permissionDeniedMsg || 'Browser notifications are blocked. Please allow them in your browser settings to receive alerts.'}</span></>
                          ) : browserPermission === 'unsupported' ? (
                            <><span>⚠️</span> <span>{t.notificationsUnsupportedMsg || 'Notifications are not supported in this browser.'}</span></>
                          ) : (
                            <><span>ℹ️</span> <span>{t.permissionPromptMsg || 'Please allow notifications in your browser when prompted to receive alerts.'}</span></>
                          )}
                        </div>
                        
                        {isIframe && (
                          <div className="pt-2 border-t border-white/5 space-y-2">
                            <p className="opacity-80">
                              {t.iframeNotice || 'In the preview environment, browser security may block notifications. Please try opening the app in a new tab.'}
                            </p>
                            <button
                              onClick={() => window.open(window.location.href, '_blank')}
                              className="flex items-center gap-1.5 px-2 py-1 bg-white/10 hover:bg-white/20 rounded text-[9px] font-bold transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {t.openInNewTab || 'Open in New Tab'}
                            </button>
                          </div>
                        )}

                        {isIOS && !isStandalone && (
                          <div className="pt-2 border-t border-white/5 space-y-2">
                            <p className="text-amber-400 opacity-90">
                              {t.iosPwaNotice || 'On iOS, notifications require the app to be added to your Home Screen. Tap the Share button and select "Add to Home Screen".'}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    <AnimatePresence>
                      {formData.notifications?.enabled && (
                        <motion.div
                          key="notification-details"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-4 overflow-hidden"
                        >
                          <div className="space-y-2">
                            <label className="text-xs uppercase tracking-widest text-zinc-500 font-bold">{t.notificationTime}</label>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                <Clock className="w-5 h-5" />
                              </div>
                              <input
                                type="time"
                                value={formData.notifications.dailyTime}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  notifications: { ...formData.notifications!, dailyTime: e.target.value }
                                })}
                                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-12 pr-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-white/20 transition-all appearance-none"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            {[
                              { key: 'includeLifeRemaining', label: t.includeLifeRemaining },
                              { key: 'monthlyUpdate', label: t.monthlyUpdate },
                              { key: 'birthdayMessage', label: t.birthdayMessage },
                            ].map((item) => (
                              <div key={item.key} className="flex items-center justify-between">
                                <span className="text-sm text-zinc-400">{item.label}</span>
                                <button
                                  type="button"
                                  onClick={() => setFormData({
                                    ...formData,
                                    notifications: { 
                                      ...formData.notifications!, 
                                      [item.key]: !formData.notifications?.[item.key as keyof typeof formData.notifications] 
                                    }
                                  })}
                                  className={`w-10 h-5 rounded-full transition-all relative ${
                                    formData.notifications?.[item.key as keyof typeof formData.notifications] ? 'bg-zinc-300' : 'bg-zinc-800 border border-zinc-700'
                                  }`}
                                >
                                  <div className={`absolute top-0.5 w-4 h-4 rounded-full transition-all ${
                                    formData.notifications?.[item.key as keyof typeof formData.notifications] ? 'right-0.5 bg-black' : 'left-0.5 bg-zinc-600'
                                  }`} />
                                </button>
                              </div>
                            ))}
                          </div>

                          <button
                            type="button"
                            disabled={testStatus !== 'idle'}
                            onClick={async () => {
                              setTestStatus('sending');
                              const result = await NotificationService.sendTestNotification(t);
                              setTestStatus(result as any);
                              // Update browser permission state in case it changed
                              if ('Notification' in window) {
                                setBrowserPermission(Notification.permission);
                              }
                              setTimeout(() => setTestStatus('idle'), 3000);
                            }}
                            className={`w-full py-3 border rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 mt-4 ${
                              testStatus === 'success' ? 'bg-emerald-900/20 border-emerald-500/50 text-emerald-400' :
                              testStatus === 'error' || testStatus === 'denied' ? 'bg-red-900/20 border-red-500/50 text-red-400' :
                              'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500'
                            }`}
                          >
                            {testStatus === 'sending' ? (
                              <div className="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
                            ) : testStatus === 'success' ? (
                              <Heart className="w-4 h-4" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            {testStatus === 'sending' ? t.sending : 
                             testStatus === 'success' ? t.sent : 
                             testStatus === 'denied' ? t.permissionDenied :
                             testStatus === 'error' ? t.failedToSend :
                             t.sendTestNotification}
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    className="w-full bg-white text-black font-bold py-3.5 rounded-xl hover:bg-zinc-200 transition-colors active:scale-[0.98] uppercase"
                  >
                    {t.save}
                  </button>
                  
                  <div className="flex justify-center gap-4 text-[10px] uppercase tracking-widest text-zinc-600 font-bold">
                    <button 
                      type="button"
                      onClick={() => setLegalView('privacy')}
                      className="hover:text-zinc-400 transition-colors"
                    >
                      Privacy Policy
                    </button>
                    <button 
                      type="button"
                      onClick={() => setLegalView('terms')}
                      className="hover:text-zinc-400 transition-colors"
                    >
                      Terms of Service
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
