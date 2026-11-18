import React, { useMemo, useState } from 'react';
import { Card, Category } from '../types';
import { CATEGORY_ORDER, CATEGORY_THEMES, flattenMeaningTags } from '../categoryStyles';

interface EssenceViewProps {
  cards: Card[];
  onUpdateEssenceNote: (id: string, note: string) => void;
  onToggleHighlight: (id: string, tag: string) => void;
}

const EssenceView: React.FC<EssenceViewProps> = ({
  cards,
  onUpdateEssenceNote,
  onToggleHighlight,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState('');

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

  const startEdit = (card: Card) => {
    setEditingId(card.id);
    setDraftNote(card.essenceNote || '');
  };

  const handleSave = (id: string) => {
    onUpdateEssenceNote(id, draftNote.trim());
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
    <div className="space-y-8 sm:space-y-10 pb-16">
      {groupedCards.map(([category, catCards]) => (
        <section key={category} className="space-y-3 sm:space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 whitespace-nowrap">
              {category}
            </h2>
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-slate-500 text-xs sm:text-sm tabular-nums whitespace-nowrap">
              {catCards.length} 項
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {catCards.map((card) => {
              const theme = CATEGORY_THEMES[card.category];
              const isEditing = editingId === card.id;
              const highlights = card.highlights || [];
              const hasNote = Boolean(card.essenceNote && card.essenceNote.trim());
              const hasContent = highlights.length > 0 || hasNote;
              const allTags = flattenMeaningTags(card.back);

              return (
                <div
                  key={card.id}
                  className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                    isEditing ? 'col-span-2 sm:col-span-2 lg:col-span-2 shadow-sm' : 'hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => (isEditing ? setEditingId(null) : startEdit(card))}
                      className="text-left flex-1 min-w-0"
                    >
                      <h3 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">
                        {card.front}
                      </h3>
                    </button>
                    <button
                      type="button"
                      onClick={() => (isEditing ? setEditingId(null) : startEdit(card))}
                      aria-label={isEditing ? '關閉編輯' : '編輯筆記'}
                      title={isEditing ? '關閉編輯' : '編輯筆記'}
                      className="min-h-[32px] min-w-[32px] p-1.5 rounded-lg bg-white/80 hover:bg-white text-slate-600 border border-black/10 flex items-center justify-center shrink-0"
                    >
                      {isEditing ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {isEditing ? (
                    <div className="mt-3 space-y-3">
                      <textarea
                        value={draftNote}
                        onChange={(e) => setDraftNote(e.target.value)}
                        rows={2}
                        placeholder="輸入屬於您的精華象意..."
                        className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-slate-400 outline-none"
                      />

                      <div>
                        <p className="text-[11px] font-medium text-slate-500 mb-1.5">
                          快速高亮既有象意：
                        </p>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                          {allTags.map((tag, i) => {
                            const active = highlights.includes(tag);
                            return (
                              <button
                                key={i}
                                type="button"
                                onClick={() => onToggleHighlight(card.id, tag)}
                                className={`px-2 py-0.5 rounded-md text-xs border transition-colors ${
                                  active
                                    ? 'bg-amber-200/90 text-amber-950 border-amber-400 font-bold'
                                    : 'bg-white/90 text-slate-600 border-black/10 hover:border-amber-300'
                                }`}
                              >
                                {active ? `★ ${tag}` : tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="min-h-[38px] px-3 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 whitespace-nowrap"
                        >
                          取消
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSave(card.id)}
                          className="min-h-[38px] px-4 py-1 rounded-lg text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 whitespace-nowrap"
                        >
                          儲存
                        </button>
                      </div>
                    </div>
                  ) : (
                    hasContent && (
                      <div className="mt-3 space-y-2">
                        {highlights.length > 0 && (
                          <div className="flex flex-wrap gap-1.5">
                            {highlights.map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-md text-xs bg-amber-200/90 text-amber-950 border border-amber-400 font-bold"
                              >
                                ★ {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        {hasNote && (
                          <p className="text-xs sm:text-sm text-slate-700 bg-white/85 rounded-lg p-2 border border-black/5 leading-relaxed">
                            {card.essenceNote}
                          </p>
                        )}
                      </div>
                    )
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

export default EssenceView;
