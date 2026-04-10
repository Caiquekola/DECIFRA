import React, { useEffect, useState, useRef } from 'react';
import './game.css';
import { WORDS_ORIG, WORDS_NORM, WORDS_SET } from './../../data/letras5/palavras';
import EndModal from '../endgame/EndModal'
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/game';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
// const TARGET_WORD = 'RAIOS';
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase();
const today = new Date().getTime();
const initDay = new Date('09-01-2025').getTime()
const diffDays = Math.abs(Math.round((today - initDay) / 1000 / 60 / 60 / 24)) % 1000;
const i = diffDays
const TARGET_WORD_ORIG = WORDS_ORIG[i];     // para mostrar
const TARGET_WORD = WORDS_NORM[i];     // para comparar

function Game(): React.ReactElement {
  const [solutionWord, setSolutionWord] = useState('');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [won, setWon] = useState(false);
  const [guesses, setGuesses] = useState<string[][]>(
    Array(MAX_ATTEMPTS).fill(null).map(() => Array(WORD_LENGTH).fill(''))
  );
  const [flips, setFlips] = useState<boolean[][]>(
    Array(MAX_ATTEMPTS).fill(null).map(() => Array(WORD_LENGTH).fill(false))
  );
  const [statuses, setStatuses] = useState<string[][]>(
    Array(MAX_ATTEMPTS).fill(null).map(() => Array(WORD_LENGTH).fill(''))
  );
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [focusEnabled, setFocusEnable] = useState(false);
  const [keyboardStatus, setKeyboardStatus] = useState<{ [key: string]: string }>({});
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array(MAX_ATTEMPTS)
      .fill(null)
      .map(() => Array(WORD_LENGTH).fill(null))
  );
  useEffect(() => {
    focusInput(0, 0);
  }, []);

  useEffect(() => {
    const initGame = () => {
      let userId = localStorage.getItem('decifra_user_id');
      if (!userId) {
        userId = 'user_' + Math.floor(Math.random() * 100000);
        localStorage.setItem('decifra_user_id', userId);
      }

      setSessionId(Math.floor(Math.random() * 9000000000) + 1000000000);
      setFocusEnable(true); 
      setTimeout(() => focusInput(0, 0), 100);
    };
    
    initGame();
  }, []);




  const focusInput = (row: number, col: number) => {
    const ref = inputRefs.current[row][col];
    if (ref) ref.focus();
  };
  const openEndModal = (didWin: boolean) => {
    setWon(didWin);
    setEndModalOpen(true);
    setGameOver(true);
  };
  const closeEndModal = () => setEndModalOpen(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      e.preventDefault();
      if (key === 'Backspace') {
        handleKeyPress('Backspace');
      } else if (key === 'Enter') {
        handleKeyPress('Enter');
      } else if (/^[a-zA-ZçÇáàâãéèêíïóôõöúñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÑ]$/.test(key)) {
        handleKeyPress(key);
      } else if (key == ' ' || key == 'Space') {
        handleKeyPress(' ');
      } else if (key == 'ArrowLeft') {
        handleKeyPress('ArrowLeft');
      } else if (key == 'ArrowRight') {
        handleKeyPress('ArrowRight');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  },);

  const norm = (ch: string) =>
    ch.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase();

  const getStatus = (letter: string, index: number): string => {
    const l = norm(letter);
    const target = TARGET_WORD.split('').map(norm).join('');
    const correctLetter = target[index];
    if (l === correctLetter) return 'correct';
    if (target.includes(l)) return 'present';
    return 'absent';
  };

  const handleKeyPress = async (key: string) => {
    if (gameOver) return;

    const newGuesses = [...guesses];
    const newStatuses = [...statuses];

    if (/^[a-zA-ZçÇáàâãéèêíïóôõöúñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÑ]$/.test(key)) {
      if (currentIndex < WORD_LENGTH) {
        newGuesses[currentAttempt][currentIndex] = key.toUpperCase();
        setGuesses(newGuesses);
        const next = Math.min(currentIndex + 1, WORD_LENGTH - 1);
        setCurrentIndex(next);
        setTimeout(() => focusInput(currentAttempt, next), 0);
      }
      return;
    }

    if (key === 'ArrowLeft') {
      if (currentIndex > 0) {
        const prev = currentIndex - 1;
        setGuesses(newGuesses);
        setCurrentIndex(prev);
        setTimeout(() => focusInput(currentAttempt, prev), 0);
      }
    }

    if (key === 'ArrowRight') {
      if (currentIndex < WORD_LENGTH - 1) {
        const prev = currentIndex + 1;
        setGuesses(newGuesses);
        setCurrentIndex(prev);
        setTimeout(() => focusInput(currentAttempt, prev), 0);
      }
    }

    if (key === 'Backspace') {
      if (newGuesses[currentAttempt][currentIndex]) {
        newGuesses[currentAttempt][currentIndex] = '';
        setGuesses(newGuesses);
      } else if (currentIndex > 0) {
        const prev = currentIndex - 1;
        newGuesses[currentAttempt][prev] = '';
        setGuesses(newGuesses);
        setCurrentIndex(prev);
        setTimeout(() => focusInput(currentAttempt, prev), 0);
      }
      return;
    }

    if (key === ' ') {
      const next = Math.min(currentIndex + 1, WORD_LENGTH - 1);
      setCurrentIndex(next);
      setTimeout(() => focusInput(currentAttempt, next), 0);
      return;
    }


    if (key === 'Enter') {
      const guessArray = newGuesses[currentAttempt];
      const isFull = guessArray.every(ch => ch && ch.length > 0);
      if (!isFull) return;

      const guessWord = guessArray.join('');
      setFocusEnable(false); // Trava inputs enquanto processa

      // LÓGICA LOCAL SUBSTITUINDO O BACKEND
      const rowStatuses = evaluateGuess(guessWord, TARGET_WORD);
      const isWon = guessWord === TARGET_WORD;
      const isGameOver = currentAttempt === MAX_ATTEMPTS - 1 && !isWon;

      // 3. ANIMAÇÃO (mantida idêntica à sua)
      const STEP = 300;
      const FLIP_TIME = 600;

      setStatuses((prev) => {
        const copy = prev.map((r) => [...r]);
        copy[currentAttempt] = Array(WORD_LENGTH).fill('');
        return copy;
      });

      for (let i = 0; i < WORD_LENGTH; i++) {
        setTimeout(() => {
          // Flip Start
          setFlips((prev) => {
            const copy = prev.map((r) => [...r]);
            copy[currentAttempt][i] = true;
            return copy;
          });

          // Flip End & Reveal Color
          setTimeout(() => {
            setFlips((prev) => {
              const copy = prev.map((r) => [...r]);
              copy[currentAttempt][i] = false;
              return copy;
            });

            setStatuses((prev) => {
              const copy = prev.map((r) => [...r]);
              copy[currentAttempt][i] = rowStatuses[i];
              return copy;
            });

            // Atualiza Teclado
            const k = norm(guessWord[i]);
            const s = rowStatuses[i];
            setKeyboardStatus((prev) => {
              const cur = prev[k];
              if (s === 'correct' || (s === 'present' && cur !== 'correct') || (s === 'absent' && !cur)) {
                return { ...prev, [k]: s };
              }
              return prev;
            });

            // Final da linha
            if (i === WORD_LENGTH - 1) {
              setTimeout(() => {
                if (isWon) {
                  setSolutionWord(guessWord);
                  openEndModal(true);
                } else if (isGameOver) {
                  setSolutionWord(TARGET_WORD_ORIG); // Agora temos acesso fácil à resposta
                  openEndModal(false);
                } else {
                  const nextAttempt = currentAttempt + 1;
                  setCurrentAttempt(nextAttempt);
                  setCurrentIndex(0);
                  setTimeout(() => focusInput(nextAttempt, 0), 10);
                  setFocusEnable(true);
                }
              }, 100);
            }
          }, FLIP_TIME);
        }, i * STEP);
      }
      return; // Fim do bloco Enter
    }


  }


  const handleVirtualKey = (key: string) => {
    if (key === '⌫') {
      handleKeyPress('Backspace');
    } else {
      handleKeyPress(key);
    }
  };
  const generateShareGrid = () => {
    return statuses
      .slice(0, currentAttempt + 1)
      .map((row) =>
        row
          .map((s) => {
            if (s === 'correct') return '🟩';
            if (s === 'present') return '🟨';
            if (s === 'absent') return '⬛';
            return '';
          })
          .join('')
      )
      .join('\n');
  };
  const shareGrid = generateShareGrid();

  const handleShare = async () => {
    const shareText = `Joguei Decifra! 🎉\n\n${generateShareGrid()}`;
    await navigator.clipboard.writeText(shareText);
    alert('Resultado copiado!');
  };
  const handlePlayYesterday = () => {
    // TODO: implemente sua lógica (ex.: offset = -1)
    console.log('Jogar ontem');
  };

  const handleSecondAction = () => {
    console.log('Segundo botão');
  };
  // Função robusta que lida corretamente com letras repetidas
  const evaluateGuess = (guessWord: string, targetWord: string) => {
    const guess = guessWord.split('');
    const target = targetWord.split('');
    const result = Array(WORD_LENGTH).fill('absent');

    // Array para rastrear quais letras da palavra alvo ainda estão "disponíveis"
    const availableLetters = [...target];

    // Passagem 1: Encontrar os acertos exatos (verdes)
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guess[i] === target[i]) {
        result[i] = 'correct';
        availableLetters[i] = null; // Remove a letra do banco
      }
    }

    // Passagem 2: Encontrar os presentes (amarelos)
    for (let i = 0; i < WORD_LENGTH; i++) {
      if (result[i] !== 'correct') {
        const indexInTarget = availableLetters.indexOf(guess[i]);
        if (indexInTarget !== -1) {
          result[i] = 'present';
          availableLetters[indexInTarget] = null; // Gasta essa letra
        }
      }
    }

    return result;
  };

  return (
    <><EndModal
      open={endModalOpen}
      won={won}
      solution={TARGET_WORD_ORIG}
      shareGrid={shareGrid}
      onShare={handleShare}
      onPlayYesterday={handlePlayYesterday}
      onSecondAction={handleSecondAction}
      onClose={closeEndModal} /><div className="container-termoo">
        <div className="tituloInputs">
          {guesses.map((row, rowIndex) => (
            <div className="container-inputs" key={rowIndex}>
              {row.map((letter, colIndex) => {
                const status = statuses[rowIndex][colIndex];
                const isActiveRow = rowIndex === currentAttempt;
                return (
                  <input
                    key={colIndex}
                    type="text"
                    ref={(el) => {
                      inputRefs.current[rowIndex][colIndex] = el;
                    }}
                    className={`letter-box ${status} ${flips[rowIndex][colIndex] ? 'spin' : ''} ${focusEnabled ? 'focus-visible' : ''} ${isActiveRow ? 'active-row' : ''}`}
                    value={letter}
                    readOnly
                    onMouseDown={(e) => {
                      e.preventDefault();
                      if (rowIndex === currentAttempt) {
                        setCurrentIndex(colIndex);
                        setTimeout(() => focusInput(rowIndex, colIndex), 0);
                      }
                    }} />

                );
              })}
            </div>
          ))}
        </div>
        {/* TODO: Quando o usuário digita está indo para o primeiro campo */}
        <div className="keyboard">
          <div className="keyboard-row">
            {'QWERTYUIOP'.split('').map((key) => {
              const status = keyboardStatus[norm(key)];
              return (
                <button
                  key={key}
                  className={`key ${status || ''}`}
                  onClick={() => handleVirtualKey(key)}
                >
                  {key}
                </button>
              );
            })}
          </div>

          <div className="keyboard-row">
            {'ASDFGHJKL'.split('').map((key) => {
              const status = keyboardStatus[norm(key)];
              return (
                <button
                  key={key}
                  className={`key ${status || ''}`}
                  onClick={() => handleVirtualKey(key)}
                >
                  {key}
                </button>
              );
            })}
            <button className="key wide" onClick={() => handleVirtualKey('⌫')}>⌫</button>

          </div>

          <div className="keyboard-row">
            {'ZXCVBNM'.split('').map((key, i) => {
              const status = keyboardStatus[norm(key)];
              return (
                <React.Fragment key={key}>
                  <button
                    className={`key ${status || ''}`}
                    onClick={() => handleVirtualKey(key)}
                  >
                    {key}
                  </button>
                </React.Fragment>
              );
            })}
            <button className="key wide" onClick={() => handleKeyPress('Enter')}>Enter</button>
          </div>
        </div>
      </div></>
  );
}

export default Game;
