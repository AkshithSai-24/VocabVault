export interface WordEntry {
  id?: string;
  word: string;
  meaning: string;
  example: string;
  synonyms: string[];
  customMeaning?: string;
  source: 'ai' | 'custom';
  createdAt: number;
}

export interface AIWordResult {
  meaning: string;
  example: string;
  synonyms: string[];
}
