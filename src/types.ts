export type ChapterId =
  | 'intro'
  | 'embeddings'
  | 'position'
  | 'attention'
  | 'multihead'
  | 'sandbox';

export interface Token {
  id: string;
  text: string;
  position: number;
}

export interface WordVector {
  word: string;
  /** Toy 2-D layout coordinate, -100 to 100. X = femininity, Y = royalty. */
  x: number;
  y: number;
  category:
    | 'animal'
    | 'royal'
    | 'person'
    | 'furniture'
    | 'verb'
    | 'adjective'
    | 'pronoun'
    | 'location';
}

export interface AttentionHead {
  id: number;
  name: string;
  description: string;
  /** Tailwind colour family, e.g. 'pink' or 'sky'. */
  color: string;
  /** A human-readable summary of the relation this head happens to track. */
  focusType: string;
}
