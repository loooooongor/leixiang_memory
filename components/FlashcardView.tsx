import React, { useState, useEffect } from 'react';
import { Card, Category } from '../types';
import { CATEGORY_THEMES, splitMeaningBlocks, flattenMeaningTags } from '../categoryStyles';

interface FlashcardViewProps {
  cards: Card[];
  selectedCategory: Category | 'ALL';
}

const FlashcardView: React.FC<FlashcardViewProps> = ({
  cards,
  selectedCategory,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [cards.length, selectedCategory]);

  if (cards.length === 0) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        目前分類沒有可學習的卡片
      </div>
    );
  }

  const safeIndex = currentIndex >= cards.length ? 0 : currentIndex;
  const currentCard = cards[safeIndex];
  const theme = CATEGORY_THEMES[currentCard.category];
  const blocks = splitMeaningBlocks(currentCard.back);
  const totalTags = flattenMeaningTags(currentCard.back).length;
  const isDense = totalTags > 18;
  const highlights = currentCard.highlights || [];

  const goPrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const goNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  return (
    <div className="flex flex-col items-center max-w-3xl mx-auto py-1 sm:py-4">
      <div className="mb-2.5 sm:mb-4 flex justify-between items-center w-full text-slate-500 text-xs sm:text-sm font-medium px-1 tabular-nums">
        <span>
          第 {safeIndex + 1} / {cards.length} 張
        </span>
        <span>{currentCard.category}</span>
      </div>

      {/* Grid-stacked 3D flip container so back face never clips or hides meanings on mobile */}
      <div
        className="w-full perspective-1000 cursor-pointer mb-4 sm:mb-8"
        onClick={() => setIsFlipped((prev) => !prev)}
      >
        <div
          className={`relative w-full grid transition-transform duration-500 preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front Face */}
          <div
            className={`col-start-1 row-start-1 backface-hidden rounded-3xl ${theme.cardBg} ${theme.cardBorder} border shadow-sm min-h-[250px] sm:min-h-[360px] p-6 sm:p-12 flex flex-col items-center justify-center text-center ${
              isFlipped ? 'pointer-events-none' : 'pointer-events-auto'
            }`}
          >
            <span className={`text-xs font-medium mb-3 ${theme.accentText}`}>
              {currentCard.category}
            </span>
            <h2 className="text-5xl sm:text-8xl font-bold text-slate-900 mb-4 sm:mb-6">
              {currentCard.front}
            </h2>
            <p className="text-slate-500 text-xs sm:text-base">點擊翻面查看象意</p>
          </div>

          {/* Back Face */}
          <div
            className={`col-start-1 row-start-1 rotate-y-180 backface-hidden rounded-3xl ${theme.cardBg} ${theme.cardBorder} border shadow-sm min-h-[250px] sm:min-h-[360px] p-4 sm:p-8 flex flex-col justify-between ${
              isFlipped ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/5">
                <span className="text-base sm:text-xl font-bold text-slate-900">
                  {currentCard.front}
                </span>
                <span className={`text-xs font-medium ${theme.accentText}`}>
                  點擊卡片翻回正面
                </span>
              </div>

              <div className={isDense ? 'space-y-2' : 'space-y-3'}>
                {blocks.map((block, bi) => (
                  <div
                    key={bi}
                    className={`flex flex-wrap justify-center ${
                      isDense ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-2.5'
                    }`}
                  >
                    {block.map((tag, i) => {
                      const isHighlighted = highlights.includes(tag);
                      return (
                        <span
                          key={`${bi}-${i}`}
                          className={`rounded-lg border transition-colors ${
                            isDense
                              ? 'px-2 py-0.5 sm:px-3 sm:py-1.5 text-xs sm:text-base'
                              : 'px-2.5 py-1 sm:px-4 sm:py-2 text-xs sm:text-lg'
                          } ${
                            isHighlighted
                              ? 'bg-amber-200/90 text-amber-950 border-amber-400 font-bold'
                              : `${theme.tagBg} font-medium`
                          }`}
                        >
                          {isHighlighted ? `★ ${tag}` : tag}
                        </span>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={goPrev}
          aria-label="上一張"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-slate-200 text-slate-800 shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center justify-center text-xl"
        >
          ←
        </button>
        <button
          type="button"
          onClick={goNext}
          aria-label="下一張"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-slate-900 text-white shadow-sm hover:bg-slate-800 active:scale-95 transition-all flex items-center justify-center text-xl"
        >
          →
        </button>
      </div>
    </div>
  );
};

export default FlashcardView;
