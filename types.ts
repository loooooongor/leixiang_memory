export enum Category {
  DI_ZHI = '地支類象',
  XING_SU = '二十八星宿',
  SHEN_JIANG = '十二神將',
  BA_GUA = '八卦類象',
  LIU_QIN = '六親類象',
  CHANG_SHENG = '十二長生',
  TIAN_GAN = '天干類象',
  GUAN_XI = '作用關係',
  YAO_WEI = '爻位類象',
  SHEN_SHA = '神煞'
}

export interface Card {
  id: string;
  category: Category;
  front: string;
  back: string;
  mastered: boolean;
  lastReviewed?: number;
  highlights?: string[];
  essenceNote?: string;
}

export enum AppMode {
  VIEW = 'VIEW',
  LEARN = 'LEARN',
  QUIZ = 'QUIZ',
  ESSENCE = 'ESSENCE'
}

export interface QuizQuestion {
  id: string;
  type: 'choice' | 'match';
  question: string;
  answer: string;
  options?: string[];
  category: Category;
}
