import raw from './palavras.txt?raw';

const norm = (s: string) =>
  s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase();

export const WORDS_ORIG = raw
  .trim()
  .split(/\r?\n/)
  .map(w => w.trim())
  .filter(Boolean)
  .filter(w => [...w].length === 5);

export const WORDS_NORM = WORDS_ORIG.map(norm); // array indexável
export const WORDS_SET  = new Set(WORDS_NORM);  // para validar palpites
