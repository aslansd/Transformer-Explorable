export type ChapterId = 'intro' | 'embeddings' | 'position' | 'attention' | 'multihead' | 'sandbox';

export interface Token {
  id: string;
  text: string;
  position: number;
}

export interface WordVector {
  word: string;
  x: number; // 2D layout representation (-100 to 100)
  y: number;
  category: 'animal' | 'royal' | 'furniture' | 'verb' | 'adjective' | 'pronoun' | 'location';
}

export interface AttentionHead {
  id: number;
  name: string;
  description: string;
  color: string; // Tailwind color name like 'amber' or 'rose'
  focusType: string; // What syntactic relation it looks for
}
