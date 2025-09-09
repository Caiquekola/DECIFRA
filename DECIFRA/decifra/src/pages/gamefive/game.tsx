import React, { useEffect, useState, useRef } from 'react';
import './game.css';
import { WORDS_ORIG, WORDS_NORM, WORDS_SET } from './../../data/letras5/palavras';

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
  const [showModal, setShowModal] = useState(false);
  const [focusEnabled, setFocusEnable] = useState(true);
  const [keyboardStatus, setKeyboardStatus] = useState<{ [key: string]: string }>({});
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array(MAX_ATTEMPTS)
      .fill(null)
      .map(() => Array(WORD_LENGTH).fill(null))
  );
  useEffect(() => {
    focusInput(0, 0);
  }, []);
  const focusInput = (row: number, col: number) => {
    const ref = inputRefs.current[row][col];
    if (ref) ref.focus();
  };


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;

      if (key === 'Backspace') {
        handleKeyPress('Backspace');
      } else if (key === 'Enter') {
        handleKeyPress('Enter');
      } else if (/^[a-zA-ZçÇáàâãéèêíïóôõöúñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÑ]$/.test(key)) {
        handleKeyPress(key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

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

  const handleKeyPress = (key: string) => {
    if (gameOver) return;

    const newGuesses = [...guesses];
    const newStatuses = [...statuses];

    if (/^[a-zA-ZçÇáàâãéèêíïóôõöúñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÑ]$/.test(key) && currentIndex < WORD_LENGTH) {
      newGuesses[currentAttempt][currentIndex] = key.toUpperCase();
      setGuesses(newGuesses);
      setCurrentIndex((prev) => {
        const next = prev + 1;
        setTimeout(() => focusInput(currentAttempt, Math.min(next, WORD_LENGTH - 1)), 10);
        return next;
      });
    }

    if (key === 'Backspace' && currentIndex > 0) {
      newGuesses[currentAttempt][currentIndex - 1] = '';
      setGuesses(newGuesses);
      setCurrentIndex((prev) => {
        const prevIndex = prev - 1;
        setTimeout(() => focusInput(currentAttempt, prevIndex), 10);
        return prevIndex;
      });
    }

    if (key === 'Enter' && currentIndex === WORD_LENGTH) {
      const guess = newGuesses[currentAttempt].join('');
      setFocusEnable(false);

      if (guess.length === WORD_LENGTH) {
        // 1) Pré-calcula os statuses da linha
        const rowStatuses: string[] = [];
        const norm = (ch: string) =>
          ch.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase();
        const targetNorm = TARGET_WORD.split('').map(norm).join('');

        const getStatusDelayed = (letter: string, index: number): string => {
          const l = norm(letter);
          const correctLetter = targetNorm[index];
          if (l === correctLetter) return 'correct';
          if (targetNorm.includes(l)) return 'present';
          return 'absent';
        };

        for (let i = 0; i < WORD_LENGTH; i++) {
          rowStatuses[i] = getStatusDelayed(guess[i], i);
        }

        const STEP = 600;       // intervalo entre as letras (ms)
        const FLIP_TIME = 600;  // duração do flip; combine com o CSS (.spin)

        /* limpa a linha antes de revelar */
        setStatuses((prev) => {
          const copy = prev.map((r) => [...r]);
          copy[currentAttempt] = Array(WORD_LENGTH).fill('');
          return copy;
        });

        /* garante flips false antes de começar */
        setFlips((prev) => {
          const copy = prev.map((r) => [...r]);
          copy[currentAttempt] = Array(WORD_LENGTH).fill(false);
          return copy;
        });

        for (let i = 0; i < WORD_LENGTH; i++) {
          const delay = i * STEP;

          setTimeout(() => {
            // 1) Inicia o flip dessa célula
            setFlips((prev) => {
              const copy = prev.map((r) => [...r]);
              copy[currentAttempt][i] = true;
              return copy;
            });

            // 2) Quando o flip terminar, aplica a cor e atualiza teclado
            setTimeout(() => {
              // para o flip
              setFlips((prev) => {
                const copy = prev.map((r) => [...r]);
                copy[currentAttempt][i] = false;
                return copy;
              });

              // aplica a cor (status) APÓS flip
              setStatuses((prev) => {
                const copy = prev.map((r) => [...r]);
                copy[currentAttempt][i] = rowStatuses[i];
                return copy;
              });

              // teclado (mesma lógica de prioridade)
              const k = norm(guess[i]);
              const s = rowStatuses[i];
              setKeyboardStatus((prev) => {
                const cur = prev[k];
                if (s === 'correct' || (s === 'present' && cur !== 'correct') || (s === 'absent' && !cur)) {
                  return { ...prev, [k]: s };
                }
                return prev;
              });

              // 3) Depois da última letra “terminar”, segue o jogo
              if (i === WORD_LENGTH - 1) {
                setTimeout(() => {
                  if (guess === TARGET_WORD) {
                    setShowModal(true);
                    setGameOver(true);
                  } else if (currentAttempt === MAX_ATTEMPTS - 1) {
                    alert(`Fim de jogo! A palavra era ${TARGET_WORD}`);
                    setGameOver(true);
                  } else {
                    const nextAttempt = currentAttempt + 1;
                    setCurrentAttempt(nextAttempt);
                    setCurrentIndex(0);
                    setTimeout(() => focusInput(nextAttempt, 0), 10);
                    setFocusEnable(true);
                  }
                }, 0);
              }
            }, FLIP_TIME);
          }, delay);
        }
      }
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

  const handleShare = async () => {
    const shareText = `Joguei Decifra! 🎉\n\n${generateShareGrid()}`;
    await navigator.clipboard.writeText(shareText);
    alert('Resultado copiado!');
  };



  return (
    <div className="container-termoo">
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
                  readOnly={!isActiveRow}
                  onFocus={(e) => {
                    if (!isActiveRow) e.target.blur();
                  }}

                />
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

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>🎉 Parabéns!</h2>
            <p>Você acertou a palavra!</p>
            <button onClick={handleShare}>Compartilhar</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Game;
