import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Category, Card, AppMode } from './types';
import { INITIAL_DATA } from './constants';
import { CATEGORY_ORDER, CATEGORY_SHORT_MAP } from './categoryStyles';
import FlashcardView from './components/FlashcardView';
import QuizView from './components/QuizView';
import ListView from './components/ListView';
import EssenceView from './components/EssenceView';

const STORAGE_KEY = 'manwu_cards_v2';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.VIEW);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let savedList: Card[] = [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          savedList = parsed;
        }
      }
    } catch {
      savedList = [];
    }

    const savedByKey = new Map<string, Card>();
    savedList.forEach((item) => {
      if (item && item.category && item.front) {
        savedByKey.set(`${item.category}::${item.front}`, item);
      }
    });

    const merged: Card[] = INITIAL_DATA.map((d, i) => {
      const existing = savedByKey.get(`${d.category}::${d.front}`);
      return {
        id: `card-${i}`,
        category: d.category,
        front: d.front,
        back: existing?.back ?? d.back,
        mastered: existing?.mastered ?? false,
        lastReviewed: existing?.lastReviewed,
        highlights: Array.isArray(existing?.highlights) ? existing.highlights : [],
        essenceNote: typeof existing?.essenceNote === 'string' ? existing.essenceNote : '',
      };
    });

    setCards(merged);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }, []);

  useEffect(() => {
    if (cards.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    }
  }, [cards]);

  const toggleHighlight = useCallback((id: string, tag: string) => {
    setCards((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        const current = c.highlights || [];
        const exists = current.includes(tag);
        return {
          ...c,
          highlights: exists ? current.filter((t) => t !== tag) : [...current, tag],
        };
      })
    );
  }, []);

  const updateCardBack = useCallback((id: string, newBack: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, back: newBack } : c))
    );
  }, []);

  const resetCardBack = useCallback((id: string) => {
    const index = Number(id.replace('card-', ''));
    const original = INITIAL_DATA[index];
    if (!original) return;
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, back: original.back } : c))
    );
  }, []);

  const updateEssenceNote = useCallback((id: string, note: string) => {
    setCards((prev) =>
      prev.map((c) => (c.id === id ? { ...c, essenceNote: note } : c))
    );
  }, []);

  const filteredCards = useMemo(() => {
    const query = searchQuery.trim();
    return cards.filter((card) => {
      const matchCategory =
        selectedCategory === 'ALL' || card.category === selectedCategory;
      if (!matchCategory) return false;
      if (!query || mode === AppMode.LEARN || mode === AppMode.QUIZ) return true;
      return (
        card.front.includes(query) ||
        card.back.includes(query) ||
        (card.essenceNote && card.essenceNote.includes(query))
      );
    });
  }, [cards, selectedCategory, searchQuery, mode]);

  const showSearch = mode === AppMode.VIEW || mode === AppMode.ESSENCE;

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Compact Single-Row Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 sm:px-6 py-2.5 sm:py-3.5 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center gap-2">
          <h1 className="text-base sm:text-xl font-bold text-slate-900 whitespace-nowrap shrink-0">
            萬物類象記憶
          </h1>

          <nav className="flex bg-slate-100 rounded-xl p-1 gap-0.5 shrink-0">
            <button
              type="button"
              onClick={() => setMode(AppMode.VIEW)}
              className={`px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                mode === AppMode.VIEW
                  ? 'bg-white shadow-xs text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              檢視
            </button>
            <button
              type="button"
              onClick={() => setMode(AppMode.LEARN)}
              className={`px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                mode === AppMode.LEARN
                  ? 'bg-white shadow-xs text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              學習
            </button>
            <button
              type="button"
              onClick={() => setMode(AppMode.QUIZ)}
              className={`px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                mode === AppMode.QUIZ
                  ? 'bg-white shadow-xs text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              測驗
            </button>
            <button
              type="button"
              onClick={() => setMode(AppMode.ESSENCE)}
              className={`px-2.5 sm:px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap shrink-0 ${
                mode === AppMode.ESSENCE
                  ? 'bg-white shadow-xs text-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              精華
            </button>
          </nav>
        </div>
      </header>

      {/* Search & Single-Line Horizontal Scrollable Categories on Mobile */}
      <div className="max-w-6xl mx-auto w-full px-3 sm:px-6 pt-2.5 sm:pt-5 space-y-2.5 sm:space-y-4">
        {showSearch && (
          <div className="relative">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"
              aria-hidden="true"
            >
              🔍
            </span>
            <input
              type="text"
              placeholder="搜尋名稱或類象..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl py-2.5 sm:py-3.5 pl-10 pr-4 focus:bg-white focus:ring-2 focus:ring-slate-300 outline-none text-sm sm:text-base"
            />
          </div>
        )}

        <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-1.5 sm:flex-wrap sm:justify-center sm:gap-2 py-0.5">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all whitespace-nowrap shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 border-slate-900 text-white'
                : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
            }`}
          >
            全部
          </button>
          {CATEGORY_ORDER.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-all whitespace-nowrap shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 border-slate-900 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
              }`}
            >
              {CATEGORY_SHORT_MAP[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-6 py-2.5 sm:py-6">
        {mode === AppMode.VIEW && (
          <ListView
            cards={filteredCards}
            onToggleHighlight={toggleHighlight}
            onUpdateCardBack={updateCardBack}
            onResetCardBack={resetCardBack}
          />
        )}
        {mode === AppMode.LEARN && (
          <FlashcardView
            cards={filteredCards}
            selectedCategory={selectedCategory}
          />
        )}
        {mode === AppMode.QUIZ && (
          <QuizView
            cards={filteredCards.length > 0 ? filteredCards : cards}
            category={selectedCategory}
          />
        )}
        {mode === AppMode.ESSENCE && (
          <EssenceView
            cards={filteredCards}
            onUpdateEssenceNote={updateEssenceNote}
            onToggleHighlight={toggleHighlight}
          />
        )}
      </main>
    </div>
  );
};

export default App;
