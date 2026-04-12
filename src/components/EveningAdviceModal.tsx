import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Moon, X, RefreshCw } from 'lucide-react';
import { AIService } from '../services/aiService';
import { BucketListItem, Language } from '../types';
import { translations } from '../translations';

interface EveningAdviceModalProps {
  items: BucketListItem[];
  language: Language;
  onClose: () => void;
}

export const EveningAdviceModal: React.FC<EveningAdviceModalProps> = ({ items, language, onClose }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  const fetchAdvice = async () => {
    setLoading(true);
    const result = await AIService.generateEveningAdvice(items, language);
    setAdvice(result);
    setLoading(false);
  };

  useEffect(() => {
    fetchAdvice();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl relative"
      >
        {/* Header Decor */}
        <div className="h-32 bg-gradient-to-b from-indigo-500/20 to-transparent flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-4 left-10 w-2 h-2 bg-white rounded-full animate-pulse" />
            <div className="absolute top-10 right-12 w-1 h-1 bg-white rounded-full animate-pulse delay-700" />
            <div className="absolute bottom-8 left-1/4 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-300" />
          </div>
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-xl border border-white/10">
            <Moon className="w-8 h-8 text-indigo-400" />
          </div>
        </div>

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-8 pb-8 text-center">
          <h2 className="text-xl font-bold mb-2 tracking-tight uppercase italic text-white/90">
            {t.eveningAdviceTitle}
          </h2>
          
          <div className="min-h-[120px] flex flex-col items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <RefreshCw className="w-6 h-6 text-indigo-500" />
                </motion.div>
                <p className="text-sm text-zinc-500 animate-pulse uppercase tracking-widest font-bold">
                  {t.eveningAdviceLoading}
                </p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="relative">
                  <Sparkles className="absolute -top-4 -left-4 w-4 h-4 text-amber-500/40" />
                  <p className="text-lg text-zinc-200 leading-relaxed font-medium italic">
                    "{advice}"
                  </p>
                  <Sparkles className="absolute -bottom-4 -right-4 w-4 h-4 text-amber-500/40" />
                </div>

                <button
                  onClick={onClose}
                  className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors uppercase tracking-widest text-sm"
                >
                  {t.save}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
