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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {catCards.map((card) => {
              const theme = CATEGORY_THEMES[card.category];
              const isEditing = editingId === card.id;
              const highlights = card.highlights || [];
              const blocks = splitMeaningBlocks(card.back);

              return (
                <div
                  key={card.id}
                  className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl sm:rounded-3xl p-5 sm:p-6 flex flex-col h-full transition-shadow hover:shadow-sm`}
                >
                  <div className="flex justify-between items-center gap-2 mb-3">
                    <span className={`text-xs font-medium ${theme.accentText}`}>
                      {card.category}
                    </span>
                    <button
                      type="button"
                      onClick={() => (isEditing ? setEditingId(null) : startEditing(card))}
                      className="min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-medium bg-white/80 hover:bg-white text-slate-700 border border-black/10 transition-colors whitespace-nowrap"
                    >
                      {isEditing ? '關閉' : '編輯'}
                    </button>
                  </div>

                  <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                    {card.front}
                  </h3>

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
                    <div className="space-y-3">
                      {blocks.map((block, bi) => (
                        <div key={bi} className="flex flex-wrap gap-1.5 sm:gap-2">
                          {block.map((tag, i) => {
                            const isHighlighted = highlights.includes(tag);
                            return (
                              <button
                                key={`${bi}-${i}`}
                                type="button"
                                onClick={() => onToggleHighlight(card.id, tag)}
                                title={isHighlighted ? '點擊取消重點高亮' : '點擊標記為重點高亮'}
                                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs sm:text-sm border transition-all text-left ${
                                  isHighlighted
                                    ? 'bg-amber-200/90 text-amber-950 border-amber-400 font-bold shadow-xs'
                                    : `${theme.tagBg} hover:border-amber-300`
                                }`}
                              >
                                {isHighlighted ? `★ ${tag}` : tag}
                              </button>
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
