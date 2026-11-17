import { Category } from './types';

export const CATEGORY_ORDER: Category[] = [
  Category.LIU_QIN,
  Category.SHEN_JIANG,
  Category.DI_ZHI,
  Category.YAO_WEI,
  Category.CHANG_SHENG,
  Category.GUAN_XI,
  Category.BA_GUA,
  Category.TIAN_GAN,
  Category.SHEN_SHA,
  Category.XING_SU,
];

export const CATEGORY_SHORT_MAP: Record<Category, string> = {
  [Category.DI_ZHI]: '地支',
  [Category.BA_GUA]: '八卦',
  [Category.TIAN_GAN]: '天干',
  [Category.SHEN_JIANG]: '神將',
  [Category.LIU_QIN]: '六親',
  [Category.CHANG_SHENG]: '長生',
  [Category.GUAN_XI]: '關係',
  [Category.YAO_WEI]: '爻位',
  [Category.SHEN_SHA]: '神煞',
  [Category.XING_SU]: '星宿',
};

export interface CategoryTheme {
  cardBg: string;
  cardBorder: string;
  accentText: string;
  tagBg: string;
}

export const CATEGORY_THEMES: Record<Category, CategoryTheme> = {
  [Category.LIU_QIN]: {
    cardBg: 'bg-rose-50/80',
    cardBorder: 'border-rose-200/80',
    accentText: 'text-rose-900',
    tagBg: 'bg-white/90 border-rose-200/60 text-slate-800',
  },
  [Category.SHEN_JIANG]: {
    cardBg: 'bg-indigo-50/80',
    cardBorder: 'border-indigo-200/80',
    accentText: 'text-indigo-900',
    tagBg: 'bg-white/90 border-indigo-200/60 text-slate-800',
  },
  [Category.DI_ZHI]: {
    cardBg: 'bg-emerald-50/80',
    cardBorder: 'border-emerald-200/80',
    accentText: 'text-emerald-900',
    tagBg: 'bg-white/90 border-emerald-200/60 text-slate-800',
  },
  [Category.YAO_WEI]: {
    cardBg: 'bg-sky-50/80',
    cardBorder: 'border-sky-200/80',
    accentText: 'text-sky-900',
    tagBg: 'bg-white/90 border-sky-200/60 text-slate-800',
  },
  [Category.CHANG_SHENG]: {
    cardBg: 'bg-teal-50/80',
    cardBorder: 'border-teal-200/80',
    accentText: 'text-teal-900',
    tagBg: 'bg-white/90 border-teal-200/60 text-slate-800',
  },
  [Category.GUAN_XI]: {
    cardBg: 'bg-amber-50/75',
    cardBorder: 'border-amber-200/80',
    accentText: 'text-amber-900',
    tagBg: 'bg-white/90 border-amber-200/60 text-slate-800',
  },
  [Category.BA_GUA]: {
    cardBg: 'bg-violet-50/80',
    cardBorder: 'border-violet-200/80',
    accentText: 'text-violet-900',
    tagBg: 'bg-white/90 border-violet-200/60 text-slate-800',
  },
  [Category.TIAN_GAN]: {
    cardBg: 'bg-cyan-50/80',
    cardBorder: 'border-cyan-200/80',
    accentText: 'text-cyan-900',
    tagBg: 'bg-white/90 border-cyan-200/60 text-slate-800',
  },
  [Category.SHEN_SHA]: {
    cardBg: 'bg-orange-50/75',
    cardBorder: 'border-orange-200/80',
    accentText: 'text-orange-900',
    tagBg: 'bg-white/90 border-orange-200/60 text-slate-800',
  },
  [Category.XING_SU]: {
    cardBg: 'bg-slate-100/90',
    cardBorder: 'border-slate-200',
    accentText: 'text-slate-800',
    tagBg: 'bg-white/90 border-slate-200/80 text-slate-800',
  },
};

export function splitMeaningBlocks(back: string): string[][] {
  return back
    .split(/[。]/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) =>
      block
        .split(/[，、；,;]/)
        .map((t) => t.trim())
        .filter(Boolean)
    )
    .filter((tags) => tags.length > 0);
}

export function flattenMeaningTags(back: string): string[] {
  return splitMeaningBlocks(back).flat();
}
