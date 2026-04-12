import React, { useState } from 'react';
import { BucketListItem, Language } from '../types';
import { X, Plus, CheckCircle2, Circle, Trash2, ListTodo, RotateCcw, StickyNote, Save, Unlock, Pencil, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';
import { AIService } from '../services/aiService';

interface BucketListViewProps {
  items: BucketListItem[];
  language: Language;
  onUpdate: (items: BucketListItem[]) => void;
  onClose: () => void;
  isPremium?: boolean;
  onUpgrade?: () => void;
  remainingYears: number;
  isBonusTime: boolean;
}

export const BucketListView: React.FC<BucketListViewProps> = ({ 
  items, 
  language, 
  onUpdate, 
  onClose, 
  isPremium, 
  onUpgrade,
  remainingYears,
  isBonusTime
}) => {
  const [newItemText, setNewItemText] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [activeCategory, setActiveCategory] = useState<'annual' | 'life'>('annual');
  const [editingMemoId, setEditingMemoId] = useState<string | null>(null);
  const [editingCountId, setEditingCountId] = useState<string | null>(null);
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState<string | null>(null);
  const [memoText, setMemoText] = useState('');
  const [countInput, setCountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const t = translations[language || 'ja'];

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    const newItem: BucketListItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      completed: false,
      category: activeCategory,
      currentCount: 0,
      targetCount: 1,
      note: ''
    };
    
    onUpdate([...items, newItem]);
    setNewItemText('');
  };

  const toggleItem = (id: string) => {
    onUpdate(items.map(item => {
      if (item.id === id) {
        const target = item.targetCount || 1;
        if (target > 1) {
          const nextCount = (item.currentCount || 0) + 1;
          const isCompleted = nextCount >= target;
          return { 
            ...item, 
            currentCount: nextCount,
            completed: isCompleted,
            completedAt: isCompleted ? Date.now() : undefined
          };
        } else {
          return { 
            ...item, 
            completed: !item.completed,
            completedAt: !item.completed ? Date.now() : undefined,
            currentCount: !item.completed ? 1 : 0
          };
        }
      }
      return item;
    }));
  };

  const saveGoalSettings = (id: string) => {
    const count = parseInt(countInput);
    if (isNaN(count) || count < 1) return;

    onUpdate(items.map(item => {
      if (item.id === id) {
        const isCompleted = (item.currentCount || 0) >= count;
        return { 
          ...item, 
          targetCount: count,
          note: noteInput.trim(),
          completed: isCompleted,
          completedAt: isCompleted ? (item.completedAt || Date.now()) : undefined
        };
      }
      return item;
    }));
    setEditingCountId(null);
  };

  const deleteItem = (id: string) => {
    onUpdate(items.filter(item => item.id !== id));
  };

  const saveMemo = (id: string) => {
    onUpdate(items.map(item => {
      if (item.id === id) {
        return { ...item, memo: memoText.trim() };
      }
      return item;
    }));
    setEditingMemoId(null);
    setMemoText('');
  };

  const startEditingMemo = (item: BucketListItem) => {
    setEditingMemoId(item.id);
    setMemoText(item.memo || '');
  };

  const startEditingCount = (item: BucketListItem) => {
    setEditingCountId(item.id);
    setCountInput(String(item.targetCount || 1));
    setNoteInput(item.note || '');
  };

  const generateAdvice = async (item: BucketListItem) => {
    if (!isPremium) {
      onUpgrade?.();
      return;
    }
    
    setIsGeneratingAdvice(item.id);
    try {
      const advice = await AIService.generateGoalAdvice(
        item.text,
        remainingYears,
        isBonusTime,
        language
      );
      
      onUpdate(items.map(i => i.id === item.id ? { ...i, aiAdvice: advice } : i));
    } catch (error) {
      console.error('Failed to generate goal advice:', error);
    } finally {
      setIsGeneratingAdvice(null);
    }
  };

  const activeItems = items.filter(i => !i.completed);
  const completedItems = items.filter(i => i.completed).sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
  
  const categoryItems = items.filter(i => (i.category || 'life') === activeCategory);
  const categoryTotal = categoryItems.length;
  const categoryCompleted = categoryItems.filter(i => i.completed).length;
  const categoryPercent = categoryTotal > 0 ? Math.round((categoryCompleted / categoryTotal) * 100) : 0;

  const displayItems = activeTab === 'active' 
    ? activeItems.filter(i => (i.category || 'life') === activeCategory)
    : completedItems.filter(i => (i.category || 'life') === activeCategory);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 300 }}
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-zinc-900 border-l border-zinc-800 shadow-2xl flex flex-col"
    >
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md" style={{ paddingTop: 'calc(env(safe-area-inset-top) + 1.5rem)' }}>
        <div className="flex items-center gap-2">
          <ListTodo className="w-5 h-5 text-zinc-400" />
          <h2 className="text-xl font-bold tracking-tight uppercase">{t.bucketList}</h2>
        </div>
        <button 
          onClick={onClose}
          className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 flex gap-2 border-b border-zinc-800">
        <button 
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === 'active' ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {t.active} ({activeItems.length})
        </button>
        <button 
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
            activeTab === 'completed' ? 'bg-white text-black' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {t.completed} ({completedItems.length})
        </button>
      </div>

      <div className="px-4 py-2 border-b border-zinc-800/50 bg-zinc-900/30">
        <div className="flex gap-4 mb-2">
          <button 
            onClick={() => setActiveCategory('annual')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-all pb-1 border-b-2 ${
              activeCategory === 'annual' ? 'border-white text-white' : 'border-transparent text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {t.annualGoals}
          </button>
          <button 
            onClick={() => setActiveCategory('life')}
            className={`text-[10px] font-bold uppercase tracking-widest transition-all pb-1 border-b-2 ${
              activeCategory === 'life' ? 'border-white text-white' : 'border-transparent text-zinc-600 hover:text-zinc-400'
            }`}
          >
            {t.lifeGoals}
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
            {t.progress}
          </div>
          <div className="text-[10px] font-mono text-zinc-400">
            {categoryCompleted}/{categoryTotal} ({categoryPercent}%)
          </div>
        </div>
        <div className="mt-1.5 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${categoryPercent}%` }}
            className="h-full bg-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {activeTab === 'active' && (
          <form onSubmit={addItem} className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder={activeCategory === 'annual' ? t.annualPlaceholder : t.lifePlaceholder}
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            />
            <button 
              type="submit"
              className="p-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>
        )}

        <div className="space-y-2">
          {displayItems.length === 0 ? (
            <div className="text-center py-12 text-zinc-600 italic text-sm">
              {activeTab === 'active' ? t.noActiveGoals : t.noCompletedGoals}
            </div>
          ) : (
            displayItems.map((item) => {
              const itemTarget = item.targetCount || 1;
              const itemCurrent = item.currentCount || 0;
              const itemPercent = Math.min(100, Math.round((itemCurrent / itemTarget) * 100));
              const isMultiStep = itemTarget > 1;

              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={item.id}
                  className="flex flex-col gap-2"
                >
                  <div className="group flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all">
                    <button 
                      onClick={() => toggleItem(item.id)}
                      className="shrink-0 text-zinc-500 hover:text-white transition-colors"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm ${item.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>
                        {item.text}
                      </div>
                      
                      {item.note && (
                        <div className="text-[10px] text-zinc-500 mt-0.5 italic">
                          {item.note}
                        </div>
                      )}

                      {isMultiStep && !item.completed && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 uppercase tracking-widest">
                            <span>{t.progressLabel}</span>
                            <span>{itemCurrent}/{itemTarget} ({itemPercent}%)</span>
                          </div>
                          <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${itemPercent}%` }}
                              className="h-full bg-emerald-500/50"
                            />
                          </div>
                        </div>
                      )}

                      {item.completed && item.completedAt && (
                        <div className="text-[10px] text-zinc-600 font-mono mt-0.5">
                          {new Date(item.completedAt).getFullYear()}年{String(new Date(item.completedAt).getMonth() + 1).padStart(2, '0')}月 {t.completedAt}
                        </div>
                      )}
                      {!item.completed && item.memo && (
                        <div className="text-[10px] text-zinc-500 mt-1 flex items-center gap-1">
                          <StickyNote className="w-3 h-3" />
                          <span className="truncate">{item.memo}</span>
                        </div>
                      )}
                      {item.completed && item.memo && editingMemoId !== item.id && (
                        <div className="text-[10px] text-zinc-400 mt-1 bg-zinc-900/50 p-1.5 rounded border border-zinc-800/50 italic">
                          {item.memo}
                        </div>
                      )}

                      {!item.completed && item.aiAdvice && (
                        <div className="mt-2 p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-lg relative overflow-hidden group/advice">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            <span className="text-[9px] font-bold text-amber-500 uppercase tracking-wider">{t.aiAdviceTitle}</span>
                          </div>
                          <div className="text-[10px] text-zinc-300 leading-relaxed">
                            {item.aiAdvice}
                          </div>
                          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 blur-2xl -mr-8 -mt-8" />
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-1 transition-all">
                      {!item.completed && (
                        <>
                          <button 
                            onClick={() => generateAdvice(item)}
                            disabled={isGeneratingAdvice === item.id}
                            title={t.getAiAdvice}
                            className={`p-1 transition-colors relative ${isGeneratingAdvice === item.id ? 'text-amber-500' : 'text-zinc-600 hover:text-amber-500'}`}
                          >
                            {isGeneratingAdvice === item.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Sparkles className="w-4 h-4" />
                            )}
                            {!isPremium && (
                              <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 shadow-lg">
                                <Unlock className="w-2 h-2 text-black" />
                              </div>
                            )}
                          </button>
                          <button 
                            onClick={() => startEditingCount(item)}
                            title={t.targetCount}
                            className={`p-1 transition-colors ${editingCountId === item.id ? 'text-white' : 'text-zinc-600 hover:text-white'}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {item.completed && (
                        <>
                          <button 
                            onClick={() => {
                              if (isPremium) {
                                startEditingMemo(item);
                              } else if (onUpgrade) {
                                onUpgrade();
                              }
                            }}
                            title={t.memo}
                            className={`p-1 transition-colors ${editingMemoId === item.id ? 'text-white' : 'text-zinc-600 hover:text-white'} relative`}
                          >
                            <StickyNote className="w-4 h-4" />
                            {!isPremium && (
                              <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 shadow-lg">
                                <Unlock className="w-2 h-2 text-black" />
                              </div>
                            )}
                          </button>
                          <button 
                            onClick={() => {
                              onUpdate(items.map(i => i.id === item.id ? { ...i, completed: false, currentCount: 0, completedAt: undefined } : i));
                            }}
                            title={t.restore}
                            className="p-1 text-zinc-600 hover:text-white transition-colors"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => deleteItem(item.id)}
                        title={t.delete}
                        className="p-1 text-zinc-600 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <AnimatePresence>
                    {editingCountId === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden px-1"
                      >
                        <div className="flex flex-col gap-3 p-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{t.targetCount}</span>
                            <input
                              type="number"
                              min="1"
                              value={countInput}
                              onChange={(e) => setCountInput(e.target.value)}
                              className="w-16 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-xs text-white focus:outline-none"
                            />
                            <span className="text-[10px] text-zinc-500">{t.times}</span>
                          </div>
                          
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{t.noteLabel}</span>
                            <textarea
                              autoFocus
                              value={noteInput}
                              onChange={(e) => setNoteInput(e.target.value)}
                              placeholder={t.notePlaceholder}
                              className="w-full bg-zinc-900 border border-zinc-700 rounded px-3 py-2 text-xs text-white focus:outline-none resize-none min-h-[60px]"
                            />
                          </div>

                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => setEditingCountId(null)}
                              className="px-3 py-1.5 bg-zinc-700 text-zinc-300 rounded text-xs hover:bg-zinc-600 transition-colors"
                            >
                              {t.cancel}
                            </button>
                            <button
                              onClick={() => saveGoalSettings(item.id)}
                              className="px-3 py-1.5 bg-white text-black rounded text-xs font-bold hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
                            >
                              <Save className="w-3.5 h-3.5" />
                              {t.save}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {editingMemoId === item.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden px-1"
                      >
                        <div className="flex gap-2 p-2 bg-zinc-800 border border-zinc-700 rounded-lg">
                          <textarea
                            autoFocus
                            value={memoText}
                            onChange={(e) => setMemoText(e.target.value)}
                            placeholder={t.memoPlaceholder}
                            className="flex-1 bg-transparent text-xs text-zinc-200 focus:outline-none resize-none min-h-[60px]"
                          />
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => saveMemo(item.id)}
                              className="p-2 bg-white text-black rounded-lg hover:bg-zinc-200 transition-colors"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingMemoId(null)}
                              className="p-2 bg-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
};
