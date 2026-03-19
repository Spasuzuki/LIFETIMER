import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Activity, Brain, Heart, Info } from 'lucide-react';
import { translations } from '../translations';
import { Language } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';
import { differenceInDays, addDays, format } from 'date-fns';

interface BiorhythmViewProps {
  birthDate: string;
  language: Language;
  onClose: () => void;
}

export const BiorhythmView: React.FC<BiorhythmViewProps> = ({ birthDate, language, onClose }) => {
  const t = translations[language || 'ja'];
  const today = new Date();
  const birth = new Date(birthDate);
  const daysSinceBirth = differenceInDays(today, birth);

  const calculateBiorhythm = (days: number, period: number) => {
    return Math.sin((2 * Math.PI * days) / period);
  };

  const getStatus = (value: number) => {
    if (value > 0.5) return { text: t.highCondition, color: 'text-emerald-500' };
    if (value < -0.5) return { text: t.lowCondition, color: 'text-rose-500' };
    return { text: t.neutralCondition, color: 'text-zinc-400' };
  };

  // Generate data for the chart (30 days range)
  const chartData = Array.from({ length: 31 }, (_, i) => {
    const offset = i - 15;
    const currentDays = daysSinceBirth + offset;
    const date = addDays(today, offset);
    
    return {
      name: format(date, 'MM/dd'),
      physical: calculateBiorhythm(currentDays, 23) * 100,
      emotional: calculateBiorhythm(currentDays, 28) * 100,
      intellectual: calculateBiorhythm(currentDays, 33) * 100,
      isToday: offset === 0,
    };
  });

  const physicalToday = calculateBiorhythm(daysSinceBirth, 23);
  const emotionalToday = calculateBiorhythm(daysSinceBirth, 28);
  const intellectualToday = calculateBiorhythm(daysSinceBirth, 33);

  const stats = [
    { 
      label: t.physical, 
      value: physicalToday, 
      icon: <Activity className="w-5 h-5" />, 
      color: '#10b981',
      period: 23
    },
    { 
      label: t.emotional, 
      value: emotionalToday, 
      icon: <Heart className="w-5 h-5" />, 
      color: '#f43f5e',
      period: 28
    },
    { 
      label: t.intellectual, 
      value: intellectualToday, 
      icon: <Brain className="w-5 h-5" />, 
      color: '#3b82f6',
      period: 33
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight uppercase italic">{t.biorhythm}</h2>
              <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">{format(today, 'yyyy.MM.dd')}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          {/* Current Status Cards */}
          <div className="grid grid-cols-3 gap-3">
            {stats.map((stat, i) => {
              const status = getStatus(stat.value);
              return (
                <div key={i} className="bg-zinc-800/50 border border-zinc-800 p-4 rounded-2xl flex flex-col items-center text-center">
                  <div className="mb-2" style={{ color: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                    {stat.label}
                  </div>
                  <div className={`text-sm font-black uppercase italic ${status.color}`}>
                    {status.text}
                  </div>
                  <div className="mt-2 w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((stat.value + 1) / 2) * 100}%` }}
                      className="h-full"
                      style={{ backgroundColor: stat.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">30-Day Forecast</h3>
              <div className="flex gap-4">
                {stats.map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">{s.label.slice(0, 1)}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="h-64 w-full bg-zinc-800/30 rounded-2xl p-4 border border-zinc-800/50">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#52525b" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    interval={6}
                  />
                  <YAxis hide domain={[-110, 110]} />
                  <ReferenceLine x={chartData[15].name} stroke="#ffffff" strokeDasharray="3 3" opacity={0.3} />
                  <ReferenceLine y={0} stroke="#3f3f46" />
                  <Line 
                    type="monotone" 
                    dataKey="physical" 
                    stroke="#10b981" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="emotional" 
                    stroke="#f43f5e" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="intellectual" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Description */}
          <div className="bg-zinc-800/30 p-4 rounded-2xl border border-zinc-800/50 flex gap-4">
            <Info className="w-5 h-5 text-zinc-500 flex-shrink-0" />
            <p className="text-xs text-zinc-400 leading-relaxed">
              {t.biorhythmDesc}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
