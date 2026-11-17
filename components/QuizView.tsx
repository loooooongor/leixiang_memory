import React, { useState, useEffect } from 'react';
import { Card, QuizQuestion, Category } from '../types';
import { CATEGORY_THEMES, flattenMeaningTags } from '../categoryStyles';

interface QuizViewProps {
  cards: Card[];
  category: Category | 'ALL';
}

const QuizView: React.FC<QuizViewProps> = ({ cards, category }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    setIsStarted(false);
    setShowResult(false);
    setFeedback(null);
    setSelectedOption(null);
  }, [category]);

  const startQuiz = () => {
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(10, shuffled.length));
    const newQuestions: QuizQuestion[] = selected.map((card) => {
      const distractors = cards
        .filter((c) => c.id !== card.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map((c) => c.front);

      const allTags = flattenMeaningTags(card.back);
      const clueCount = Math.min(allTags.length, Math.floor(Math.random() * 4) + 5);
      const randomClues = [...allTags]
        .sort(() => Math.random() - 0.5)
        .slice(0, clueCount);

      return {
        id: card.id,
        type: 'choice',
        question: randomClues.join('、'),
        answer: card.front,
        options: [card.front, ...distractors].sort(() => Math.random() - 0.5),
        category: card.category,
      };
    });
    setQuestions(newQuestions);
    setScore(0);
    setCurrentIndex(0);
    setShowResult(false);
    setIsStarted(true);
    setFeedback(null);
    setSelectedOption(null);
  };

  const handleAnswer = (option: string) => {
    if (feedback) return;
    setSelectedOption(option);
    const isCorrect = option === questions[currentIndex].answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) setScore((s) => s + 1);

    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex((i) => i + 1);
        setFeedback(null);
        setSelectedOption(null);
      } else {
        setShowResult(true);
      }
    }, 1000);
  };

  if (!isStarted) {
    return (
      <div className="flex flex-col items-center py-6 sm:py-14">
        <div className="bg-sky-50/70 border border-sky-200/80 rounded-3xl p-6 sm:p-10 max-w-md w-full text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">
            準備好開始測驗嗎？
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mb-6 sm:mb-8">
            將從目前選中的分類（{category === 'ALL' ? '全部' : category}）抽選 {Math.min(10, cards.length)} 題
          </p>
          <button
            type="button"
            onClick={startQuiz}
            disabled={cards.length < 2}
            className="w-full min-h-[48px] bg-slate-900 text-white py-3.5 rounded-2xl font-bold text-base sm:text-lg hover:bg-slate-800 active:scale-[0.99] transition-all disabled:opacity-40"
          >
            開始測驗
          </button>
        </div>
      </div>
    );
  }

  if (showResult) {
    const total = questions.length || 1;
    const finalPoints = Math.round((score / total) * 100);
    return (
      <div className="flex flex-col items-center py-6 sm:py-12 text-center">
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-6 sm:p-10 max-w-md w-full">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">測驗結束</h2>
          <div className="bg-white rounded-2xl p-5 border border-emerald-100 mb-6">
            <p className="text-slate-500 text-xs sm:text-sm mb-1">您的得分</p>
            <p className="text-5xl font-black text-slate-900 tabular-nums">{finalPoints}</p>
            <p className="text-xs text-slate-500 mt-1 tabular-nums">
              答對 {score} / {questions.length} 題
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsStarted(false)}
              className="flex-1 min-h-[48px] bg-white border border-slate-200 text-slate-800 rounded-xl font-bold text-sm hover:bg-slate-50"
            >
              返回準備
            </button>
            <button
              type="button"
              onClick={startQuiz}
              className="flex-1 min-h-[48px] bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800"
            >
              再測一次
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[currentIndex];
  const theme = CATEGORY_THEMES[q.category];
  const displayClues = flattenMeaningTags(q.question);

  return (
    <div className="max-w-4xl mx-auto py-1 sm:py-4">
      {/* Compact Score & Progress Strip */}
      <div className="bg-slate-50 rounded-2xl px-4 py-2.5 mb-3 sm:mb-5 border border-slate-200/80 flex justify-between items-center">
        <span className="text-xs sm:text-sm font-bold text-slate-800 tabular-nums">
          第 {currentIndex + 1} / {questions.length} 題 · 得分 {score}
        </span>
        <button
          type="button"
          onClick={() => setIsStarted(false)}
          className="min-h-[36px] px-2 text-slate-500 text-xs sm:text-sm hover:text-slate-900 whitespace-nowrap"
        >
          結束測驗
        </button>
      </div>

      {/* Colored Question Card */}
      <div
        className={`${theme.cardBg} ${theme.cardBorder} border rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-3 sm:mb-5 text-center`}
      >
        <p className={`text-xs sm:text-sm mb-2.5 sm:mb-4 font-medium ${theme.accentText}`}>
          以下類象屬於哪個項目？
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
          {displayClues.map((tag, i) => (
            <span
              key={i}
              className={`px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-lg border text-xs sm:text-base font-medium ${theme.tagBg}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Options Grid: 2x2 on mobile, 4-column single row on desktop; single-line text */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
        {q.options?.map((opt, i) => {
          const isAnswer = opt === q.answer;
          const isChosen = opt === selectedOption;

          let stateStyle =
            'bg-white border-slate-200 text-slate-900 hover:border-slate-800 hover:bg-slate-50 shadow-xs';
          let prefix = '';

          if (feedback !== null) {
            if (isAnswer) {
              stateStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900';
              prefix = '✓ ';
            } else if (isChosen) {
              stateStyle = 'border-rose-400 bg-rose-50 text-rose-900';
              prefix = '✕ ';
            } else {
              stateStyle = 'border-slate-100 bg-slate-50/70 text-slate-400';
            }
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => handleAnswer(opt)}
              disabled={feedback !== null}
              className={`min-h-[48px] sm:min-h-[60px] px-2.5 sm:px-3 py-2.5 border-2 rounded-xl sm:rounded-2xl font-bold transition-all flex items-center justify-center whitespace-nowrap overflow-hidden ${
                opt.length >= 5 ? 'text-xs sm:text-sm' : 'text-sm sm:text-lg'
              } ${stateStyle}`}
            >
              <span className="truncate">
                {prefix}
                {opt}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuizView;
