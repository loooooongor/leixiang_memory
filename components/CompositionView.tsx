import React, { useMemo, useState, useEffect } from 'react';
import { Card, Category } from '../types';
import { CATEGORY_THEMES, flattenMeaningTags } from '../categoryStyles';

interface CompositionViewProps {
  cards: Card[];
}

interface PuzzleItem {
  instanceId: string;
  cardId: string;
}

const COMPOSE_CATEGORIES: { category: Category; label: string }[] = [
  { category: Category.LIU_QIN, label: '六親' },
  { category: Category.SHEN_JIANG, label: '六神 / 神將' },
  { category: Category.GUAN_XI, label: '作用關係' },
  { category: Category.YAO_WEI, label: '爻位' },
];

const SIX_GOD_PRIORITY = ['青龍', '朱雀', '勾陳', '騰蛇', '白虎', '玄武'];
const SENTENCE_STORAGE_KEY = 'manwu_composed_sentences_v1';

const cleanSymbolName = (front: string) =>
  front.replace(/[（(].*?[）)]/g, '').trim();

const makeInstanceId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const CompositionView: React.FC<CompositionViewProps> = ({ cards }) => {
  const [puzzleItems, setPuzzleItems] = useState<PuzzleItem[]>([]);
  const [activeInstanceId, setActiveInstanceId] = useState<string | null>(null);
  const [sentenceTokens, setSentenceTokens] = useState<string[]>([]);
  const [savedSentences, setSavedSentences] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SENTENCE_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSavedSentences(parsed);
      }
    } catch {
      // ignore storage read error
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(SENTENCE_STORAGE_KEY, JSON.stringify(savedSentences));
    } catch {
      // ignore storage write error
    }
  }, [savedSentences]);

  const categorizedCards = useMemo(() => {
    return COMPOSE_CATEGORIES.map(({ category, label }) => {
      let catCards = cards.filter((c) => c.category === category);
      if (category === Category.SHEN_JIANG) {
        catCards = [...catCards].sort((a, b) => {
          const aClean = cleanSymbolName(a.front);
          const bClean = cleanSymbolName(b.front);
          const ai = SIX_GOD_PRIORITY.indexOf(aClean);
          const bi = SIX_GOD_PRIORITY.indexOf(bClean);
          if (ai !== -1 && bi !== -1) return ai - bi;
          if (ai !== -1) return -1;
          if (bi !== -1) return 1;
          return 0;
        });
      }
      return { category, label, cards: catCards };
    });
  }, [cards]);

  const cardMap = useMemo(() => {
    const map = new Map<string, Card>();
    cards.forEach((c) => map.set(c.id, c));
    return map;
  }, [cards]);

  const activePuzzleItem = useMemo(
    () => puzzleItems.find((item) => item.instanceId === activeInstanceId) || null,
    [puzzleItems, activeInstanceId]
  );

  const activeCard = useMemo(
    () => (activePuzzleItem ? cardMap.get(activePuzzleItem.cardId) || null : null),
    [activePuzzleItem, cardMap]
  );

  const activeMeanings = useMemo(() => {
    if (!activeCard) return [];
    return flattenMeaningTags(activeCard.back);
  }, [activeCard]);

  // Step 1: Add chosen symbol into the puzzle sequence
  const handleAddSymbolToPuzzle = (cardId: string) => {
    setPuzzleItems((prev) => [...prev, { instanceId: makeInstanceId(), cardId }]);
  };

  const handleRemovePuzzleItem = (instanceId: string) => {
    setPuzzleItems((prev) => prev.filter((item) => item.instanceId !== instanceId));
    if (activeInstanceId === instanceId) {
      setActiveInstanceId(null);
    }
  };

  const handleRandomPrompt = () => {
    const picked: PuzzleItem[] = [];
    categorizedCards.forEach(({ category, cards: catCards }) => {
      let pool = catCards;
      if (category === Category.SHEN_JIANG) {
        const sixGods = catCards.filter((c) =>
          SIX_GOD_PRIORITY.includes(cleanSymbolName(c.front))
        );
        if (sixGods.length > 0) pool = sixGods;
      }
      if (pool.length > 0) {
        const chosen = pool[Math.floor(Math.random() * pool.length)];
        picked.push({ instanceId: makeInstanceId(), cardId: chosen.id });
      }
    });
    setPuzzleItems(picked);
    setActiveInstanceId(null);
  };

  const handleClearPuzzle = () => {
    setPuzzleItems([]);
    setActiveInstanceId(null);
  };

  // Step 3: Tap meaning to write onto ruled underline
  const handleAddToken = (token: string) => {
    setSentenceTokens((prev) => [...prev, token]);
  };

  const handleRemoveTokenAt = (index: number) => {
    setSentenceTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const handleBackspace = () => {
    setSentenceTokens((prev) => prev.slice(0, -1));
  };

  const handleClearSentence = () => {
    setSentenceTokens([]);
  };

  const fullSentence = sentenceTokens.join('');

  const handleCopySentence = async () => {
    if (!fullSentence) return;
    try {
      await navigator.clipboard.writeText(fullSentence);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore clipboard errors
    }
  };

  const handleSaveSentence = () => {
    if (!fullSentence.trim()) return;
    setSavedSentences((prev) => [fullSentence, ...prev].slice(0, 12));
    setSentenceTokens([]);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-6 max-w-4xl mx-auto">
      {/* Step 1: Symbol Palette to Build the Puzzle */}
      <section className="bg-slate-50/80 border border-slate-200 rounded-2xl p-3.5 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <h2 className="text-sm sm:text-base font-bold text-slate-900">
            1. 組合符號謎題
          </h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandomPrompt}
              className="min-h-[36px] px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 whitespace-nowrap"
            >
              隨機抽一組
            </button>
            {puzzleItems.length > 0 && (
              <button
                type="button"
                onClick={handleClearPuzzle}
                className="min-h-[36px] px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs hover:text-slate-900 whitespace-nowrap"
              >
                清空謎題
              </button>
            )}
          </div>
        </div>

        {/* 4 Symbol Categories */}
        <div className="space-y-2">
          {categorizedCards.map(({ category, label, cards: catCards }) => {
            const theme = CATEGORY_THEMES[category];
            return (
              <div
                key={category}
                className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3"
              >
                <span
                  className={`text-xs font-bold shrink-0 sm:w-20 ${theme.accentText}`}
                >
                  {label}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {catCards.map((card) => (
                    <button
                      key={card.id}
                      type="button"
                      onClick={() => handleAddSymbolToPuzzle(card.id)}
                      className={`min-h-[34px] px-2.5 py-1 rounded-lg text-xs sm:text-sm font-medium border transition-all whitespace-nowrap active:scale-95 ${theme.cardBg} ${theme.cardBorder} text-slate-800 hover:border-slate-500`}
                    >
                      {cleanSymbolName(card.front)}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Step 2: Assembled Puzzle Strip (Click a symbol here to reveal its meanings) */}
        <div className="mt-4 pt-3.5 border-t border-slate-200/80">
          <p className="text-xs font-medium text-slate-500 mb-2">
            2. 點擊下方謎題中的符號查看象意：
          </p>
          {puzzleItems.length === 0 ? (
            <p className="text-sm text-slate-400 py-2">
              請點擊上方符號組成謎題，或點「隨機抽一組」
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-y-2 text-base sm:text-xl font-medium text-slate-900">
              {puzzleItems.map((item, idx) => {
                const card = cardMap.get(item.cardId);
                if (!card) return null;
                const isSelected = item.instanceId === activeInstanceId;
                const theme = CATEGORY_THEMES[card.category];

                return (
                  <React.Fragment key={item.instanceId}>
                    <div
                      className={`inline-flex items-center rounded-xl border transition-all ${
                        isSelected
                          ? 'bg-slate-900 border-slate-900 text-white shadow-xs'
                          : `${theme.cardBg} ${theme.cardBorder} text-slate-900`
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setActiveInstanceId(item.instanceId)}
                        className="px-2.5 py-1 text-sm sm:text-lg font-bold whitespace-nowrap"
                      >
                        {cleanSymbolName(card.front)}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemovePuzzleItem(item.instanceId)}
                        aria-label={`移除 ${cleanSymbolName(card.front)}`}
                        className={`pr-2 pl-0.5 py-1 text-xs transition-colors ${
                          isSelected
                            ? 'text-slate-300 hover:text-white'
                            : 'text-slate-400 hover:text-rose-600'
                        }`}
                      >
                        ×
                      </button>
                    </div>
                    {idx < puzzleItems.length - 1 && (
                      <span
                        className="text-slate-400 mx-1.5 select-none"
                        aria-hidden="true"
                      >
                        /
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Step 2 -> 3: Meanings of the Clicked Puzzle Symbol */}
      {activeCard && (
        <section
          className={`${CATEGORY_THEMES[activeCard.category].cardBg} ${
            CATEGORY_THEMES[activeCard.category].cardBorder
          } border rounded-2xl p-4 sm:p-5`}
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-baseline gap-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                {cleanSymbolName(activeCard.front)}
              </h3>
              <span
                className={`text-xs font-medium ${
                  CATEGORY_THEMES[activeCard.category].accentText
                }`}
              >
                點擊象意填入底線
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            {activeMeanings.map((tag, i) => {
              const isHighlighted = activeCard.highlights?.includes(tag);
              return (
                <button
                  key={`${activeCard.id}-${i}`}
                  type="button"
                  onClick={() => handleAddToken(tag)}
                  className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs sm:text-sm border transition-all active:scale-95 ${
                    isHighlighted
                      ? 'bg-amber-200/90 text-amber-950 border-amber-400 font-bold'
                      : 'bg-white/95 border-black/10 text-slate-800 hover:border-slate-500'
                  }`}
                >
                  {isHighlighted ? `★ ${tag}` : tag}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Ruled Underline Sentence Composition Area */}
      <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="text-xs sm:text-sm font-bold text-slate-800">
            3. 底線造句區（點擊已填詞彙可移除）
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={handleBackspace}
              disabled={sentenceTokens.length === 0}
              className="min-h-[36px] px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
            >
              退格
            </button>
            <button
              type="button"
              onClick={handleClearSentence}
              disabled={sentenceTokens.length === 0}
              className="min-h-[36px] px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
            >
              清空
            </button>
            <button
              type="button"
              onClick={handleCopySentence}
              disabled={!fullSentence}
              className="min-h-[36px] px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap"
            >
              {copied ? '已複製' : '複製'}
            </button>
            <button
              type="button"
              onClick={handleSaveSentence}
              disabled={!fullSentence.trim()}
              className="min-h-[36px] px-3 py-1 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 disabled:opacity-40 whitespace-nowrap"
            >
              記錄造句
            </button>
          </div>
        </div>

        {/* Two Ruled Writing Lines */}
        <div
          className="relative min-h-[108px] py-2"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, transparent 0px, transparent 51px, #64748b 51px, #64748b 52px)',
            lineHeight: '52px',
          }}
        >
          {sentenceTokens.length === 0 ? (
            <span className="text-sm text-slate-300 select-none">
              先選符號組成謎題，再點謎題裡的符號並選象意填入此處…
            </span>
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-1">
              {sentenceTokens.map((token, idx) => (
                <button
                  key={`${token}-${idx}`}
                  type="button"
                  onClick={() => handleRemoveTokenAt(idx)}
                  title="點擊移除此詞"
                  className="text-lg sm:text-xl font-medium text-slate-900 hover:text-rose-600 hover:bg-rose-50/70 rounded px-1 transition-colors"
                  style={{ lineHeight: '52px' }}
                >
                  {token}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Saved Sentences History */}
      {savedSentences.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-bold text-slate-700">
              已記錄的造句（{savedSentences.length}）
            </h3>
            <button
              type="button"
              onClick={() => setSavedSentences([])}
              className="text-xs text-slate-400 hover:text-slate-700"
            >
              清除全部
            </button>
          </div>
          <div className="space-y-2">
            {savedSentences.map((sentence, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5"
              >
                <p className="text-sm sm:text-base text-slate-800 leading-relaxed">
                  {sentence}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setSavedSentences((prev) => prev.filter((_, i) => i !== idx))
                  }
                  className="text-xs text-slate-400 hover:text-rose-600 shrink-0"
                >
                  刪除
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CompositionView;
