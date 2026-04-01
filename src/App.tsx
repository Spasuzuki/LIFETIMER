/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { UserData, BucketListItem } from './types';
import { SettingsView } from './components/SettingsView';
import { TimerView } from './components/TimerView';
import { BucketListView } from './components/BucketListView';
import { BirthdayModal } from './components/BirthdayModal';
import { Settings as SettingsIcon, Menu, Activity, Unlock } from 'lucide-react';
import { CustomHourglass } from './components/CustomHourglass';
import { AnimatePresence, motion } from 'motion/react';
import { translations } from './translations';
import { NotificationService } from './services/notificationService';
import { LocalNotifications } from '@capacitor/local-notifications';
import { RevenueCatService } from './services/revenueCatService';
import { differenceInYears, parseISO, isSameDay, addYears, addMonths, differenceInMonths, differenceInWeeks, differenceInDays } from 'date-fns';
import { COUNTRIES, LIFE_EXPECTANCY } from './constants';
import { BiorhythmView } from './components/BiorhythmView';
import { PremiumModal } from './components/PremiumModal';

const STORAGE_KEY = 'bucket-list-user-data';

const DEFAULT_USER_DATA: UserData = {
  birthDate: '1995-04-01',
  gender: 'male',
  country: 'Japan',
  language: 'ja',
  notifications: {
    enabled: false,
    dailyTime: '09:00',
    dailyQuote: true,
    quoteCategory: 'mementoMori',
    weeklyLife: true,
    monthlyUpdate: true,
    birthdayMessage: true
  },
  isPremium: false
};

const App = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBucketListOpen, setIsBucketListOpen] = useState(false);
  const [isBiorhythmOpen, setIsBiorhythmOpen] = useState(false);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isBirthdayOpen, setIsBirthdayOpen] = useState(false);
  const [seconds, setSeconds] = useState(new Date().getSeconds());

  const checkBirthday = (data: UserData) => {
    const birthDate = parseISO(data.birthDate);
    const today = new Date();
    const thisYearBirthday = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    if (isSameDay(thisYearBirthday, today)) {
      const lastBirthdayShown = sessionStorage.getItem('last-birthday-shown');
      const todayStr = today.toISOString().split('T')[0];
      if (lastBirthdayShown !== todayStr) {
        setIsBirthdayOpen(true);
        sessionStorage.setItem('last-birthday-shown', todayStr);
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setSeconds(new Date().getSeconds()), 1000);
    
    const handleNotificationAction = (action: any) => {
      console.log('Notification action performed:', action);
      if (action.notification.id === 3) {
        setIsBirthdayOpen(true);
      }
    };

    LocalNotifications.addListener('localNotificationActionPerformed', handleNotificationAction);

    return () => {
      clearInterval(timer);
      LocalNotifications.removeAllListeners();
    };
  }, []);

  useEffect(() => {
    const initApp = async () => {
      await RevenueCatService.initialize();
      const isPremium = await RevenueCatService.isPremium();
      
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          const updatedData = { ...data, isPremium };
          setUserData(updatedData);
          checkBirthday(updatedData);
          NotificationService.scheduleNotifications(updatedData);
        } catch (e) {
          setUserData({ ...DEFAULT_USER_DATA, isPremium });
        }
      } else {
        setUserData({ ...DEFAULT_USER_DATA, isPremium });
        setIsSettingsOpen(true);
      }
      setIsInitialized(true);
    };

    initApp();
  }, []);

  const handleSaveSettings = (data: UserData) => {
    setUserData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setIsSettingsOpen(false);
    NotificationService.scheduleNotifications(data);
  };

  const handlePurchase = async () => {
    if (!userData) return;
    const isPremium = await RevenueCatService.isPremium();
    if (isPremium) {
      const newData = { ...userData, isPremium: true };
      setUserData(newData);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
      setIsPremiumModalOpen(false);
    }
  };

  const handleUpdateBucketList = (items: BucketListItem[]) => {
    if (!userData) return;
    const newData = { ...userData, bucketList: items };
    setUserData(newData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newData));
  };

  const t = translations[userData?.language || 'ja'];

  const getTimeOfDayClass = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'nebula-morning';
    if (hour >= 12 && hour < 17) return 'nebula-noon';
    return 'nebula-night';
  };

  if (!isInitialized) return null;

  return (
    <div className="min-h-screen text-white selection:bg-white selection:text-black">
      {/* Space Background Layers */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 stars-very-slow" />
        <div className="absolute inset-0 stars-slow" />
        <div className="absolute inset-0 stars-fast" />
        <div className={`absolute inset-0 ${getTimeOfDayClass()}`} />
      </div>

      <div className="relative z-10 min-h-[100dvh] w-full flex flex-col">
        {/* Header: Logo & Controls */}
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between p-4 sm:p-6 bg-black/40 backdrop-blur-xl border-b border-white/5" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 0.5rem)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white flex items-center justify-center rounded-xl shadow-[0_0_30px_rgba(255,255,255,0.15)] overflow-hidden">
              <motion.div
                animate={{ rotate: seconds * 6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <CustomHourglass className="w-6 h-6 sm:w-7 sm:h-7 text-black" />
              </motion.div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base sm:text-xl font-black tracking-[-0.05em] leading-none uppercase italic text-white/90">{t.title}</h1>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.45em] text-zinc-500 font-bold leading-none mt-1.5">{t.subtitle}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (userData?.isPremium) {
                  setIsBiorhythmOpen(true);
                } else {
                  setIsPremiumModalOpen(true);
                }
              }}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-zinc-900/40 border border-zinc-800/50 rounded-full transition-all group relative"
            >
              <Activity className={`w-5 h-5 transition-colors ${userData?.isPremium ? 'text-emerald-500 group-hover:text-emerald-400' : 'text-zinc-500 group-hover:text-white'}`} />
              {!userData?.isPremium && (
                <div className="absolute -top-1 -right-1">
                  <div className="bg-amber-500 rounded-full p-0.5 shadow-lg">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Unlock className="w-2 h-2 text-black" />
                    </motion.div>
                  </div>
                </div>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsBucketListOpen(true)}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-zinc-900/40 border border-zinc-800/50 rounded-full transition-all group relative"
            >
              <Menu className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSettingsOpen(true)}
              className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-zinc-900/40 border border-zinc-800/50 rounded-full transition-all group relative"
            >
              <SettingsIcon className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
            </motion.button>
          </div>
        </header>

        <main className="flex-1 flex flex-col items-center justify-start sm:justify-center w-full pt-28 sm:pt-32 pb-8 px-4 sm:px-6">
          {userData ? (
            <TimerView userData={userData} />
          ) : (
            <div className="text-center text-zinc-500 animate-pulse font-mono uppercase tracking-widest">
              {t.waitingConfig}
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {isSettingsOpen && (
          <SettingsView 
            key="settings-view"
            userData={userData || DEFAULT_USER_DATA} 
            onSave={handleSaveSettings}
            onClose={() => userData && setIsSettingsOpen(false)}
            onPreviewBirthday={() => setIsBirthdayOpen(true)}
          />
        )}
        {isBucketListOpen && (
          <BucketListView 
            key="bucket-list-view"
            items={userData?.bucketList || []}
            language={userData?.language || 'ja'}
            onUpdate={handleUpdateBucketList}
            onClose={() => setIsBucketListOpen(false)}
            isPremium={userData?.isPremium}
            onUpgrade={() => {
              setIsBucketListOpen(false);
              setIsPremiumModalOpen(true);
            }}
          />
        )}
        {isBiorhythmOpen && userData && (
          <BiorhythmView
            key="biorhythm-view"
            birthDate={userData.birthDate}
            language={userData.language}
            onClose={() => setIsBiorhythmOpen(false)}
          />
        )}
        {isPremiumModalOpen && userData && (
          <PremiumModal
            key="premium-modal"
            language={userData.language}
            onClose={() => setIsPremiumModalOpen(false)}
            onPurchase={handlePurchase}
          />
        )}
        {isBirthdayOpen && userData && (
          <BirthdayModal
            key="birthday-modal"
            language={userData.language}
            age={differenceInYears(new Date(), parseISO(userData.birthDate))}
            remainingLife={(() => {
              const birthDate = parseISO(userData.birthDate);
              const expectancyYears = userData.lifeExpectancyOverride || 
                (LIFE_EXPECTANCY[userData.country] ? 
                  (userData.gender === 'male' ? LIFE_EXPECTANCY[userData.country].male : LIFE_EXPECTANCY[userData.country].female) : 
                  80);
              const deathDate = addYears(birthDate, expectancyYears);
              const now = new Date();
              
              const years = differenceInYears(deathDate, now);
              const dateAfterYears = addYears(now, years);
              const months = differenceInMonths(deathDate, dateAfterYears);
              const dateAfterMonths = addMonths(dateAfterYears, months);
              const days = differenceInDays(deathDate, dateAfterMonths);
              
              return { years, months, weeks: days };
            })()}
            onClose={() => setIsBirthdayOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* CRT Scanline Effect Overlay */}
      <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
};

export default App;
