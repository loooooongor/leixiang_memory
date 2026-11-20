import React, { useMemo, useState } from 'react';
import { Card, Category } from '../types';
import { CATEGORY_ORDER, CATEGORY_THEMES, splitMeaningBlocks } from '../categoryStyles';

interface ListViewProps {
  cards: Card[];
  onToggleHighlight: (id: string, tag: string) => void;
  onUpdateCardBack: (id: string, newBack: string) => void;
  onResetCardBack: (id: string) => void;
}

const ListView: React.FC<ListViewProps> = ({
  cards,
  onToggleHighlight,
  onUpdateCardBack,
  onResetCardBack,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftBack, setDraftBack] = useState('');

  const groupedCards = useMemo(() => {
    const groups: Partial<Record<Category, Card[]>> = {};
    cards.forEach((card) => {
      if (!groups[card.category]) {
        groups[card.category] = [];
      }
      groups[card.category]!.push(card);
    });

    return (Object.entries(groups) as [Category, Card[]][]).sort(
      (a, b) => CATEGORY_ORDER.indexOf(a[0]) - CATEGORY_ORDER.indexOf(b[0])
    );
  }, [cards]);

  const startEditing = (card: Card) => {
    setEditingId(card.id);
    setDraftBack(card.back);
  };

  const handleSave = (id: string) => {
    const trimmed = draftBack.trim();
    if (trimmed) {
      onUpdateCardBack(id, trimmed);
    }
    setEditingId(null);
  };

  if (cards.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        找不到符合條件的類象項目
      </div>
    );
  }

  return (
    <div className="space-y-8 sm:space-y-12 pb-16">
      {groupedCards.map(([category, catCards]) => (
        <section key={category} className="space-y-4 sm:space-y-5">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-2xl font-bold text-slate-900 whitespace-nowrap">
              {category}
            </h2>
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-500 text-xs sm:text-sm tabular-nums whitespace-nowrap">
              {catCards.length} 項
            </span>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-5">
            {catCards.map((card) => {
              const theme = CATEGORY_THEMES[card.category];
              const isEditing = editingId === card.id;
              const highlights = card.highlights || [];
              const blocks = splitMeaningBlocks(card.back);

              return (
                <div
                  key={card.id}
                  className={`${theme.cardBg} ${theme.cardBorder} border rounded-xl sm:rounded-2xl p-3 sm:p-5 flex flex-col h-full transition-shadow hover:shadow-sm ${
                    isEditing ? 'col-span-2 lg:col-span-1' : ''
                  }`}
                >
                  <div className="flex justify-between items-start gap-1.5 mb-2 sm:mb-3">
                    <h3 className="text-xl sm:text-3xl font-bold text-slate-900 leading-tight">
                      {card.front}
                    </h3>
                    <button
                      type="button"
                      onClick={() => (isEditing ? setEditingId(null) : startEditing(card))}
                      aria-label={isEditing ? '關閉編輯' : '編輯象意'}
                      title={isEditing ? '關閉編輯' : '編輯象意'}
                      className="min-h-[32px] min-w-[32px] sm:min-h-[36px] sm:min-w-[36px] p-1.5 rounded-lg bg-white/60 hover:bg-white text-slate-700 transition-colors flex items-center justify-center shrink-0"
                    >
                      {isEditing ? (
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="space-y-3 flex-1 flex flex-col">
                      <textarea
                        value={draftBack}
                        onChange={(e) => setDraftBack(e.target.value)}
                        rows={4}
                        className="w-full flex-1 bg-white border border-slate-300 rounded-xl p-3 text-sm text-slate-800 focus:ring-2 focus:ring-slate-400 outline-none leading-relaxed"
                        placeholder="輸入象意，可用逗號、頓號或句號分隔..."
                      />
                      <div className="flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            onResetCardBack(card.id);
                            setEditingId(null);
                          }}
                          className="min-h-[40px] px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-white/80 transition-colors whitespace-nowrap"
                        >
                          恢復預設
                        </button>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                          >
                            取消
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSave(card.id)}
                            className="min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 whitespace-nowrap"
                          >
                            儲存
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1.5 sm:space-y-2">
                      {blocks.map((block, bi) => (
                        <div key={bi} className="flex flex-wrap items-baseline gap-x-0.5 gap-y-0.5 leading-snug">
                          {block.map((tag, i) => {
                            const isHighlighted = highlights.includes(tag);
                            return (
                              <React.Fragment key={`${bi}-${i}`}>
                                <button
                                  type="button"
                                  onClick={() => onToggleHighlight(card.id, tag)}
                                  title={isHighlighted ? '點擊取消重點高亮' : '點擊標記為重點高亮'}
                                  className={`text-xs sm:text-sm transition-colors text-left leading-snug ${
                                    isHighlighted
                                      ? 'bg-amber-200/85 text-amber-950 font-bold rounded px-1 py-0.5'
                                      : 'text-slate-700 hover:text-slate-950 py-0.5'
                                  }`}
                                >
                                  {isHighlighted ? `★${tag}` : tag}
                                </button>
                                {i < block.length - 1 && (
                                  <span className="text-slate-400 select-none text-xs" aria-hidden="true">
                                    、
                                  </span>
                                )}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default ListView;
