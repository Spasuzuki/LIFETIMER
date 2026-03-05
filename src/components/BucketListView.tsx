import React, { useState } from 'react';
import { BucketListItem, Language } from '../types';
import { X, Plus, CheckCircle2, Circle, Trash2, ListTodo, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { translations } from '../translations';

interface BucketListViewProps {
  items: BucketListItem[];
  language: Language;
  onUpdate: (items: BucketListItem[]) => void;
  onClose: () => void;
}

export const BucketListView: React.FC<BucketListViewProps> = ({ items, language, onUpdate, onClose }) => {
  const [newItemText, setNewItemText] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [activeCategory, setActiveCategory] = useState<'annual' | 'life'>('annual');
  const t = translations[language || 'ja'];

  const addItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    
    const newItem: BucketListItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      completed: false,
      category: activeCategory
    };
    
    onUpdate([...items, newItem]);
    setNewItemText('');
  };

  const toggleItem = (id: string) => {
    onUpdate(items.map(item => {
      if (item.id === id) {
        return { 
          ...item, 
          completed: !item.completed,
          completedAt: !item.completed ? Date.now() : undefined
        };
      }
      return item;
    }));
  };

  const deleteItem = (id: string) => {
    onUpdate(items.filter(item => item.id !== id));
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
            displayItems.map((item) => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={item.id}
                className="group flex items-center gap-3 p-3 bg-zinc-800/50 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all"
              >
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
                  {item.completed && item.completedAt && (
                    <div className="text-[10px] text-zinc-600 font-mono mt-0.5">
                      {new Date(item.completedAt).getFullYear()}年{String(new Date(item.completedAt).getMonth() + 1).padStart(2, '0')}月 {t.completedAt}
                    </div>
                  )}
                </div>
                <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  {item.completed && (
                    <button 
                      onClick={() => toggleItem(item.id)}
                      title={t.restore}
                      className="p-1 text-zinc-600 hover:text-white transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => deleteItem(item.id)}
                    title={t.delete}
                    className="p-1 text-zinc-600 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
};
