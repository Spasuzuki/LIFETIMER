import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, X, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';
import { translations } from '../translations';
import { Language } from '../types';

interface BirthdayModalProps {
  language: Language;
  age: number;
  remainingLife: {
    years: number;
    months: number;
    weeks: number;
  };
  onClose: () => void;
}

export const BirthdayModal: React.FC<BirthdayModalProps> = ({ language, age, remainingLife, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLetterOut, setIsLetterOut] = useState(false);
  const t = translations[language || 'ja'] || translations['ja'];

  const triggerConfetti = () => {
    const duration = 5 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 45, spread: 360, ticks: 100, zIndex: 200 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 150 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: 0.5, y: 0.5 }, colors: ['#FFD700', '#FFA500', '#FF4500', '#FFFFFF'] });
    }, 250);
  };

  const triggerFireworks = () => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0 || isLetterOut) {
        return clearInterval(interval);
      }

      const particleCount = 50;
      // fireworks
      confetti({
        particleCount,
        startVelocity: 30,
        spread: 360,
        origin: { x: randomInRange(0.1, 0.9), y: randomInRange(0.1, 0.5) },
        colors: ['#60A5FA', '#F472B6', '#FBBF24', '#34D399'],
        gravity: 0.5,
        scalar: 0.7,
        drift: 0,
        ticks: 60,
        zIndex: 50
      });
    }, 2000);
  };

  useEffect(() => {
    // No automatic triggers on mount
  }, []);

  const startButtonText = (t.birthdayStart || '{age} Start').replace('{age}', String(age));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-hidden bg-gradient-to-br from-amber-400 via-yellow-200 to-orange-400"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Floating Leaves/Shapes */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`leaf-${i}`}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360,
              opacity: 0
            }}
            animate={{ 
              y: [null, Math.random() * -100 - 50],
              x: [null, Math.random() * 50 - 25],
              rotate: [null, Math.random() * 90],
              opacity: 0.4
            }}
            transition={{ duration: 10 + Math.random() * 10, repeat: Infinity, ease: "linear" }}
            className="absolute"
          >
            <div className="w-8 h-12 bg-white/20 rounded-full" style={{ borderRadius: '60% 40% 70% 30% / 70% 30% 70% 30%' }} />
          </motion.div>
        ))}
        {/* Stationery-like abstract shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl" />

        {/* Sparkles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              opacity: 0.3,
              scale: Math.random() * 0.5 + 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -200 - 100],
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 360]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute w-2 h-2 rounded-full blur-sm bg-white"
          />
        ))}
      </div>

      <div className="relative w-full max-w-sm">
        <AnimatePresence mode="wait">
          {!isLetterOut ? (
            <motion.div
              key="envelope-container"
              initial={{ scale: 0.5, y: 200, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0, transition: { duration: 0.3 } }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative flex flex-col items-center"
            >
              {/* Card Body (Stationery Style) */}
              <motion.div 
                onClick={() => {
                  if (!isOpen) {
                    setIsOpen(true);
                    triggerConfetti();
                    setTimeout(() => setIsLetterOut(true), 800);
                  }
                }}
                whileHover={{ scale: 1.02 }}
                className="relative w-80 h-64 bg-white rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.1)] cursor-pointer flex flex-col items-center p-6 border-8 border-white group overflow-hidden"
              >
                {/* Decorative elements on the card */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-50 rounded-full" />
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-pink-50 rounded-full" />
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="space-y-3">
                    <div className="text-pink-400 font-black text-2xl tracking-widest">
                      {t.birthdayCardSubtitle || '\\ おめでとう /'}
                    </div>
                    <div className="text-zinc-800 text-3xl sm:text-4xl font-black leading-tight tracking-tighter">
                      {t.birthdayCardTitle || '誕生日メッセージ'}
                    </div>
                    <div className="text-pink-300 font-bold text-[10px] tracking-[0.2em] pt-2">
                      {t.birthdayLetter || 'BIRTHDAY WISHES & MESSAGES'}
                    </div>
                  </div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
                className="mt-8 text-white font-black tracking-widest text-sm drop-shadow-sm animate-bounce flex items-center gap-2"
              >
                <span>✨</span> TAP TO OPEN <span>✨</span>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="letter-content"
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="bg-white rounded-[2rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-zinc-900 relative overflow-hidden border-4 border-amber-200"
            >
              {/* Decorative background pattern */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              
              <div className="space-y-8 pt-4 relative z-10">
                {/* Balloon Age */}
                <div className="flex justify-center gap-2 sm:gap-4 mb-2">
                  {String(age).split('').map((digit, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: 50, opacity: 0, rotate: -10 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      transition={{ delay: 0.2 + i * 0.1, type: "spring" }}
                      className="relative"
                    >
                      <div className="text-8xl sm:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-orange-600 drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)]" style={{ fontFamily: 'system-ui' }}>
                        {digit}
                      </div>
                      {/* Balloon string effect */}
                      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-0.5 h-8 bg-gradient-to-b from-zinc-300 to-transparent" />
                    </motion.div>
                  ))}
                </div>

                <div className="text-center space-y-2">
                  <h2 className="text-lg sm:text-xl font-black tracking-[0.2em] text-zinc-900 whitespace-nowrap flex items-center justify-center gap-2">
                    <span className="text-amber-500">✨</span>
                    HAPPY BIRTHDAY
                    <span className="text-amber-500">✨</span>
                  </h2>
                  <div className="text-xs sm:text-sm font-bold text-amber-600 uppercase tracking-widest">
                    誕生日おめでとうございます!
                  </div>
                </div>

                <p className="text-base sm:text-lg leading-relaxed text-zinc-700 italic font-serif text-center px-2">
                  {t.happyBirthdayMsg || 'Happy Birthday!'}
                </p>

                <div className="py-6 border-y border-zinc-100">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.4em]">{t.untilRemainingLife || 'Until Remaining Life'}</span>
                    <div className="flex items-center gap-4 font-mono">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black">{remainingLife.years}</span>
                        <span className="text-[10px] font-bold text-zinc-400">{t.yearLabel || 'Y'}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black">{remainingLife.months}</span>
                        <span className="text-[10px] font-bold text-zinc-400">{t.monthLabel || 'M'}</span>
                      </div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black">{remainingLife.weeks}</span>
                        <span className="text-[10px] font-bold text-zinc-400">{t.weekLabel || 'W'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-lg shadow-orange-200"
                >
                  {startButtonText}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
