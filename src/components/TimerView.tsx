import * as React from 'react';
import { useState, useEffect } from 'react';
import { 
  differenceInSeconds, 
  differenceInDays, 
  differenceInMonths, 
  differenceInYears,
  addYears,
  addMonths,
  addDays,
  startOfYear,
  endOfDay,
  endOfWeek,
  endOfMonth,
  endOfYear,
  format
} from 'date-fns';
import { UserData, QuoteCategory } from '../types';
import { LIFE_EXPECTANCY } from '../constants';
import { QUOTES } from '../constants/quotes';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';

interface TimerViewProps {
  userData: UserData;
}

interface TimeRemaining {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const TimerView: React.FC<TimerViewProps> = ({ userData }) => {
  const [now, setNow] = useState(new Date());
  const [currentAnimatedProgress, setCurrentAnimatedProgress] = useState(0);
  const [activeCategory, setActiveCategory] = useState<QuoteCategory>(
    userData.notifications?.quoteCategory || 'mementoMori'
  );
  const t = translations[userData.language || 'ja'];

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Sync with userData category if it changes in settings
    if (userData.notifications?.quoteCategory) {
      setActiveCategory(userData.notifications.quoteCategory);
    }
  }, [userData.notifications?.quoteCategory]);

  const cycleCategory = () => {
    if (!userData.isPremium) return;
    
    const categories: QuoteCategory[] = ['mementoMori', 'stoicism', 'zen', 'entrepreneur'];
    const currentIndex = categories.indexOf(activeCategory);
    const nextIndex = (currentIndex + 1) % categories.length;
    setActiveCategory(categories[nextIndex]);
  };

  const getLifeExpectancy = () => {
    const data = LIFE_EXPECTANCY[userData.country] || Object.values(LIFE_EXPECTANCY)[0];
    if (!data) return 80;
    if (userData.gender === 'male') return data.male;
    if (userData.gender === 'female') return data.female;
    return data.average;
  };

  const calculateRemaining = (targetDate: Date): TimeRemaining => {
    let tempDate = now;
    const isExceeded = tempDate > targetDate;
    
    // If exceeded, we calculate the difference from targetDate to now (count up)
    const start = isExceeded ? targetDate : now;
    const end = isExceeded ? now : targetDate;

    const years = differenceInYears(end, start);
    let current = addYears(start, years);

    const months = differenceInMonths(end, current);
    current = addMonths(current, months);

    const days = differenceInDays(end, current);
    current = addDays(current, days);

    const totalSeconds = differenceInSeconds(end, current);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { years, months, days, hours, minutes, seconds };
  };

  const birthDate = new Date(userData.birthDate);
  const expectancyYears = getLifeExpectancy();
  const deathDate = addYears(birthDate, expectancyYears);
  const halfLifeDate = addYears(birthDate, expectancyYears / 2);

  const isExceeded = now > deathDate;
  const lifeRemaining = calculateRemaining(deathDate);
  
  // Short term timers
  const dayRemaining = calculateRemaining(endOfDay(now));
  const weekRemaining = calculateRemaining(endOfWeek(now));
  const monthRemaining = calculateRemaining(endOfMonth(now));
  const yearRemaining = calculateRemaining(endOfYear(now));

  const getDailyQuote = () => {
    const lang = userData.language || 'ja';
    const quotes = QUOTES[lang][activeCategory];
    
    const dayOfYear = Math.floor((now.getTime() - startOfYear(now).getTime()) / (1000 * 60 * 60 * 24));
    const index = (now.getFullYear() + dayOfYear) % quotes.length;
    return quotes[index];
  };

  const dailyQuote = getDailyQuote();

  const formatTime = (time: TimeRemaining) => {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
  };

  // Progress calculation
  const totalLifeSeconds = differenceInSeconds(deathDate, birthDate);
  const elapsedSeconds = differenceInSeconds(now, birthDate);
  const progressPercent = Math.min(120, (elapsedSeconds / totalLifeSeconds) * 100);
  const isMidpointPassed = now > halfLifeDate;

  const mainColor = isExceeded ? 'text-amber-400' : 'text-white';
  const glowColor = isExceeded ? 'drop-shadow-[0_0_35px_rgba(251,191,36,0.8)]' : 'drop-shadow-[0_0_35px_rgba(14,165,233,0.8)]';
  const barColor = isExceeded ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.8)]' : 'bg-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.6)]';
  const starColor = isExceeded ? 'bg-amber-300 shadow-[0_0_20px_#fcd34d]' : 'bg-white shadow-[0_0_15px_white]';

  return (
    <div className="w-full max-w-2xl mx-auto flex-1 flex flex-col pt-2 sm:pt-4 px-4">
      {/* Top Section: Large Life Timer */}
      <div className="text-center mb-2 sm:mb-3">
        <div className={`text-[15px] sm:text-[18px] uppercase tracking-[0.4em] mb-1 font-bold ${isExceeded ? 'text-amber-500/80' : 'text-zinc-400'}`}>
          {isExceeded ? t.giftedTime.toUpperCase() : t.remainingTime.toUpperCase()} : <span className={`${isExceeded ? 'text-amber-400' : 'text-white'} tabular-nums ml-1`}>{isExceeded ? '+' : ''}{formatTime(lifeRemaining)}</span>
        </div>
        
        <div className="flex justify-center items-end gap-6 sm:gap-16">
          <div className="flex flex-col items-center">
            <span className={`text-7xl sm:text-[150px] font-mono leading-none tracking-[-0.05em] ${mainColor} ${glowColor}`}>
              {String(lifeRemaining.years).padStart(2, '0')}
            </span>
            <span className="text-[11px] sm:text-[14px] uppercase tracking-[0.35em] text-zinc-500 font-bold mt-2 mr-[-0.35em]">{t.yearLabel.toUpperCase()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-7xl sm:text-[150px] font-mono leading-none tracking-[-0.05em] ${mainColor} ${glowColor}`}>
              {String(lifeRemaining.months).padStart(2, '0')}
            </span>
            <span className="text-[11px] sm:text-[14px] uppercase tracking-[0.35em] text-zinc-500 font-bold mt-2 mr-[-0.35em]">{t.monthLabel.toUpperCase()}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className={`text-7xl sm:text-[150px] font-mono leading-none tracking-[-0.05em] ${mainColor} ${glowColor}`}>
              {String(lifeRemaining.days).padStart(2, '0')}
            </span>
            <span className="text-[11px] sm:text-[14px] uppercase tracking-[0.35em] text-zinc-500 font-bold mt-2 mr-[-0.35em]">{t.weekLabel.toUpperCase()}</span>
          </div>
        </div>
        
        {isExceeded && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 inline-block px-4 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]"
          >
            ✨ {t.bonusTime} ✨
          </motion.div>
        )}
      </div>

      {/* Progress Bar Section */}
      <div className="my-8 sm:my-12">
        <div className="flex justify-between text-[9px] sm:text-[10px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-3">
          <span>{t.birth.toUpperCase()}</span>
          <span className="text-center">
            {t.midpoint.toUpperCase()}
            {currentAnimatedProgress > 50 ? <span className="text-amber-500/90 ml-1">({t.passed.toUpperCase()})</span> : ''}
          </span>
          <span>{t.lifeSpan.toUpperCase()}</span>
        </div>
        <div className="relative h-1 sm:h-1.5 bg-zinc-800/50 rounded-full overflow-visible">
          {/* Center indicator - Triangle arrow pointing down at the top */}
          <div className="absolute left-1/2 top-[-6px] sm:top-[-8px] -translate-x-1/2 z-0">
            <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] border-t-zinc-900" />
          </div>
          
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, progressPercent)}%` }}
            transition={{ duration: 5, ease: "easeOut" }}
            onUpdate={(latest) => {
              const w = latest.width;
              if (typeof w === 'string') {
                setCurrentAnimatedProgress(parseFloat(w));
              } else if (typeof w === 'number') {
                setCurrentAnimatedProgress(w);
              }
            }}
            className={`absolute top-0 left-0 h-full ${barColor} rounded-full flex justify-end items-center z-10`}
          >
            {/* Star-shaped handle */}
            <div className="relative translate-x-1/2">
              {/* Outer glow */}
              <div className={`absolute inset-0 ${isExceeded ? 'bg-amber-400' : 'bg-sky-400'} blur-[12px] rounded-full scale-[2.5] opacity-60`} />
              <div className="absolute inset-0 bg-white blur-[6px] rounded-full scale-150 opacity-80" />
              
              {/* The Star */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="relative w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center"
              >
                {/* 4-pointed star shape using CSS clip-path */}
                <div 
                  className={`w-full h-full ${starColor}`}
                  style={{ 
                    clipPath: 'polygon(50% 0%, 61% 39%, 100% 50%, 61% 61%, 50% 100%, 39% 61%, 0% 50%, 39% 39%)' 
                  }}
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Overflow bar for exceeded state */}
          {isExceeded && (
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent - 100}%` }}
              className="absolute top-0 left-full h-full bg-gradient-to-r from-amber-500 to-transparent opacity-50 rounded-r-full"
              style={{ width: `${Math.min(20, progressPercent - 100)}%` }}
            />
          )}
        </div>
        <div className="text-right mt-3">
          <span className={`text-[9px] sm:text-[10px] uppercase tracking-[0.25em] font-bold ${isExceeded ? 'text-amber-500/60' : 'text-zinc-600'}`}>
            {t.lifeExpectancy} : {expectancyYears} {t.years.toUpperCase()}({userData.country.toUpperCase()})
          </span>
        </div>
      </div>

      {/* Today's Words Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 mb-10 sm:mb-12 shadow-[0_30px_60px_rgba(0,0,0,0.4)] border-2 ${isExceeded ? 'border-amber-400/30' : 'border-transparent'}`}
      >
        <div className="text-center">
          <button 
            onClick={cycleCategory}
            disabled={!userData.isPremium}
            className={`w-full group outline-none ${userData.isPremium ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <div className="flex flex-col items-center">
              <h3 className={`text-xs sm:text-base font-black tracking-[0.35em] uppercase mb-1 sm:mb-2 transition-all ${userData.isPremium ? 'text-sky-600 group-hover:text-sky-500' : 'text-black'}`}>
                {t[activeCategory].toUpperCase()}
              </h3>
              <div className="relative w-full min-h-[3rem] sm:min-h-[4rem] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p 
                    key={dailyQuote}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="text-zinc-800 text-sm sm:text-xl font-serif italic leading-[1.5] sm:leading-[1.6]"
                  >
                    "{dailyQuote}"
                  </motion.p>
                </AnimatePresence>
              </div>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Bottom Timers Section */}
      <div className="space-y-2 sm:space-y-3 mb-6">
        {/* NOW */}
        <div>
          <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-0.5">{t.now.toUpperCase()}:</div>
          <div className="flex items-baseline gap-3 sm:gap-5 font-mono text-2xl sm:text-[48px] leading-none tracking-tighter">
            <span className="text-white">{format(now, 'yyyy.MM.dd')}</span>
            <span className="text-zinc-500 text-sm sm:text-2xl">{format(now, 'eee')}</span>
            <span className="text-white tabular-nums">{format(now, 'HH:mm:ss')}</span>
          </div>
        </div>

        {/* WEEK REMAINING */}
        <div>
          <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-0.5">{t.remaining.toUpperCase()} ({t.week.toUpperCase()}):</div>
          <div className="flex items-baseline gap-3 sm:gap-5 font-mono text-2xl sm:text-[48px] leading-none tracking-tighter">
            <div className="flex items-baseline gap-1.5">
              <span className="text-white">{String(weekRemaining.days).padStart(2, '0')}</span>
              <span className="text-[11px] sm:text-[13px] text-zinc-500 font-bold uppercase tracking-widest">{t.days}</span>
            </div>
            <span className="text-white tabular-nums">{formatTime(weekRemaining)}</span>
          </div>
        </div>

        {/* MONTH REMAINING */}
        <div>
          <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-0.5">{t.remaining.toUpperCase()} ({t.month.toUpperCase()}):</div>
          <div className="flex items-baseline gap-3 sm:gap-5 font-mono text-2xl sm:text-[48px] leading-none tracking-tighter">
            <div className="flex items-baseline gap-1.5">
              <span className="text-white">{String(monthRemaining.days).padStart(2, '0')}</span>
              <span className="text-[11px] sm:text-[13px] text-zinc-500 font-bold uppercase tracking-widest">{t.days}</span>
            </div>
            <span className="text-white tabular-nums">{formatTime(monthRemaining)}</span>
          </div>
        </div>

        {/* YEAR REMAINING */}
        <div>
          <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-zinc-500 font-bold mb-0.5">{t.remaining.toUpperCase()} ({t.year.toUpperCase()}):</div>
          <div className="flex items-baseline gap-3 sm:gap-5 font-mono text-2xl sm:text-[48px] leading-none tracking-tighter">
            <div className="flex items-baseline gap-1.5">
              <span className="text-white">{String(yearRemaining.months).padStart(2, '0')}</span>
              <span className="text-[11px] sm:text-[13px] text-zinc-500 font-bold uppercase tracking-widest">{t.monthShort}</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-white">{String(yearRemaining.days).padStart(2, '0')}</span>
              <span className="text-[11px] sm:text-[13px] text-zinc-500 font-bold uppercase tracking-widest">{t.days}</span>
            </div>
            <span className="text-white tabular-nums">{formatTime(yearRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-zinc-900 pt-4 pb-8 flex justify-between text-[9px] sm:text-[11px] uppercase tracking-[0.35em] text-zinc-700 font-bold">
        <span>{t.lifeExpectancy}: {expectancyYears} {t.years.toUpperCase()} ({userData.country.toUpperCase()})</span>
        <span>{t.birth.toUpperCase()}: {userData.birthDate}</span>
      </div>
    </div>
  );
};
