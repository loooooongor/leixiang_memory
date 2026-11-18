import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Category, Card, AppMode } from './types';
import { INITIAL_DATA } from './constants';
import { CATEGORY_ORDER, CATEGORY_SHORT_MAP } from './categoryStyles';
import FlashcardView from './components/FlashcardView';
import QuizView from './components/QuizView';
import ListView from './components/ListView';
import EssenceView from './components/EssenceView';
import CompositionView from './components/CompositionView';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';

const STORAGE_KEY = 'manwu_cards_v2';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.VIEW);
  const [cards, setCards] = useState<Card[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (isSearchOpen) {
      searchInputRef.current?.focus();
    }
  }, [isSearchOpen]);

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
      if (!query || mode === AppMode.LEARN || mode === AppMode.QUIZ || mode === AppMode.COMPOSE) {
        return true;
      }
      return (
        card.front.includes(query) ||
        card.back.includes(query) ||
        (card.essenceNote && card.essenceNote.includes(query))
      );
    });
  }, [cards, selectedCategory, searchQuery, mode]);

  const canSearch = mode === AppMode.VIEW || mode === AppMode.ESSENCE;
  const showCategories = mode !== AppMode.COMPOSE;

  const renderNavIcon = (tabMode: AppMode, isActive: boolean) => {
    const strokeWidth = isActive ? 2.2 : 1.7;
    switch (tabMode) {
      case AppMode.VIEW:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        );
      case AppMode.LEARN:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        );
      case AppMode.QUIZ:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case AppMode.ESSENCE:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        );
      case AppMode.COMPOSE:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={strokeWidth} viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
        );
    }
  };

  const navTabs: { mode: AppMode; label: string }[] = [
    { mode: AppMode.VIEW, label: '檢視' },
    { mode: AppMode.LEARN, label: '學習' },
    { mode: AppMode.QUIZ, label: '測驗' },
    { mode: AppMode.ESSENCE, label: '精華' },
    { mode: AppMode.COMPOSE, label: '取象' },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Compact Single-Row Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-3 sm:px-6 py-2 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2 min-h-[40px]">
          <h1 className="text-base sm:text-xl font-bold text-slate-900 whitespace-nowrap shrink-0">
            萬物類象記憶
          </h1>

          <div className="flex items-center gap-2 shrink-0">
            <PWAInstallButton />

            {canSearch && (
              <button
                type="button"
                onClick={() => setIsSearchOpen((prev) => !prev)}
                aria-label="搜尋"
                title="搜尋"
                className={`min-w-[40px] min-h-[40px] rounded-xl flex items-center justify-center transition-colors ${
                  isSearchOpen || searchQuery.trim()
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Expandable Search Input + Single-Line Horizontal Scrollable Categories */}
      {((canSearch && (isSearchOpen || searchQuery.trim() !== '')) || showCategories) && (
        <div className="max-w-6xl mx-auto w-full px-3 sm:px-6 pt-2.5 sm:pt-4 space-y-2.5">
          {canSearch && (isSearchOpen || searchQuery.trim() !== '') && (
            <div className="relative flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="搜尋名稱或類象..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-4 pr-10 focus:bg-white focus:ring-2 focus:ring-slate-300 outline-none text-sm sm:text-base"
              />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                aria-label="關閉搜尋"
                className="absolute right-2 min-w-[32px] min-h-[32px] flex items-center justify-center text-slate-400 hover:text-slate-800"
              >
                ✕
              </button>
            </div>
          )}

          {showCategories && (
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
          )}
        </div>
      )}

      {/* Main Content Area (padded bottom for fixed footer nav) */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-3 sm:px-6 pt-2.5 sm:pt-5 pb-20">
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
        {mode === AppMode.COMPOSE && <CompositionView cards={cards} />}
      </main>

      <OfflineIndicator />

      {/* Bottom Icon Navigation Footer */}
      <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80">
        <nav className="max-w-2xl mx-auto grid grid-cols-5 h-14 sm:h-16">
          {navTabs.map((tab) => {
            const isActive = mode === tab.mode;
            return (
              <button
                key={tab.mode}
                type="button"
                onClick={() => setMode(tab.mode)}
                className={`flex flex-col items-center justify-center gap-0.5 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-slate-900 font-bold'
                    : 'text-slate-400 hover:text-slate-700 font-medium'
                }`}
              >
                {renderNavIcon(tab.mode, isActive)}
                <span className="text-[11px] leading-tight">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </footer>
    </div>
  );
};

export default App;
