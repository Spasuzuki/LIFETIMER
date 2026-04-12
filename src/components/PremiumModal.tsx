import * as React from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Crown, Check, ShieldCheck, Zap, Sparkles, Activity, StickyNote, Loader2 } from 'lucide-react';
import { translations } from '../translations';
import { Language } from '../types';
import { RevenueCatService } from '../services/revenueCatService';
import { PurchasesPackage } from '@revenuecat/purchases-capacitor';

interface PremiumModalProps {
  language: Language;
  onClose: () => void;
  onPurchase: () => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({ language, onClose, onPurchase }) => {
  const t = translations[language || 'ja'];
  const [offering, setOffering] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    const fetchOffering = async () => {
      const currentOffering = await RevenueCatService.getOfferings();
      setOffering(currentOffering);
      setLoading(false);
    };
    fetchOffering();
  }, []);

  const handlePurchase = async () => {
    if (!offering || offering.availablePackages.length === 0) return;
    
    setPurchasing(true);
    const success = await RevenueCatService.purchasePackage(offering.availablePackages[0]);
    setPurchasing(false);
    
    if (success) {
      onPurchase();
    }
  };

  const handleRestore = async () => {
    setPurchasing(true);
    const success = await RevenueCatService.restorePurchases();
    setPurchasing(false);
    
    if (success) {
      onPurchase();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-sm bg-zinc-900 border border-amber-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)] flex flex-col"
      >
        {/* Header with Gradient */}
        <div className="relative h-32 bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,white,transparent_70%)]" />
          </div>
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Crown className="w-16 h-16 text-white drop-shadow-lg" />
          </motion.div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          <h2 className="text-2xl font-black tracking-tight text-white mb-2 uppercase italic">
            {t.premiumTitle}
          </h2>
          <p className="text-zinc-400 text-sm mb-8 font-medium">
            {t.premiumSubtitle}
          </p>

          <div className="w-full space-y-4 mb-10">
            {[
              { icon: <Sparkles className="w-5 h-5 text-amber-500" />, text: t.premiumFeature1 },
              { icon: <Activity className="w-5 h-5 text-amber-500" />, text: t.premiumFeature2 },
              { icon: <StickyNote className="w-5 h-5 text-amber-500" />, text: t.premiumFeature3 },
              { icon: <Zap className="w-5 h-5 text-amber-500" />, text: t.premiumFeature4 },
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-4 text-left bg-zinc-800/50 p-3 rounded-2xl border border-zinc-700/50">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <span className="text-sm text-zinc-200 font-bold leading-tight">
                  {feature.text}
                </span>
              </div>
            ))}
          </div>

          <div className="w-full space-y-3">
            <button
              onClick={handlePurchase}
              disabled={loading || purchasing || !offering}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 transition-all active:scale-[0.98] uppercase tracking-widest text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {purchasing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {t.purchase}
                  {offering?.availablePackages[0]?.product.priceString && (
                    <span className="ml-2 opacity-80">({offering.availablePackages[0].product.priceString})</span>
                  )}
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={purchasing}
              className="w-full bg-transparent text-zinc-500 font-bold py-3 rounded-2xl hover:text-zinc-300 transition-colors uppercase tracking-widest text-xs disabled:opacity-50"
            >
              {t.cancel}
            </button>
          </div>

          <button 
            onClick={handleRestore}
            disabled={purchasing}
            className="mt-6 text-[10px] text-zinc-600 uppercase tracking-widest font-bold hover:text-zinc-400 transition-colors disabled:opacity-50"
          >
            {t.restorePurchase}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
