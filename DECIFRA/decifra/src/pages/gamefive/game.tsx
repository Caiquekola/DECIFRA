import React, { useEffect, useState, useRef } from 'react';
import './game.css';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;
const TARGET_WORD = 'RAIOS';

function Game(): React.ReactElement {
  const [guesses, setGuesses] = useState<string[][]>(
    Array(MAX_ATTEMPTS).fill(null).map(() => Array(WORD_LENGTH).fill(''))
  );
  const [statuses, setStatuses] = useState<string[][]>(
    Array(MAX_ATTEMPTS).fill(null).map(() => Array(WORD_LENGTH).fill(''))
  );
  const [currentAttempt, setCurrentAttempt] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [focusEnabled,setFocusEnable] = useState(true);
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

  const getStatus = (letter: string, index: number): string => {
    const correctLetter = TARGET_WORD[index];
    if (letter === correctLetter) return 'correct';
    if (TARGET_WORD.includes(letter)) return 'present';
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
        const rowStatuses: string[] = [];
        const newKeyboardStatus = { ...keyboardStatus };

        for (let i = 0; i < WORD_LENGTH; i++) {
          const status = getStatus(guess[i], i);
          rowStatuses[i] = status;

          const current = newKeyboardStatus[guess[i]];

          // Prioridade: correct > present > absent
          if (
            status === 'correct' ||
            (status === 'present' && current !== 'correct') ||
            (status === 'absent' && !current)
          ) {
            newKeyboardStatus[guess[i]] = status;
          }
        }

        newStatuses[currentAttempt] = rowStatuses;
        setStatuses(newStatuses);
        setKeyboardStatus(newKeyboardStatus);

        if (guess === TARGET_WORD) {
          setTimeout(() => setShowModal(true), 1600);
          setGameOver(true);
        } else if (currentAttempt === MAX_ATTEMPTS - 1) {
          alert(`Fim de jogo! A palavra era ${TARGET_WORD}`);
          setGameOver(true);
        } else {
            setTimeout(() => {
                const nextAttempt = currentAttempt + 1;
                setCurrentAttempt(nextAttempt);
                setCurrentIndex(0);
                setTimeout(() => focusInput(nextAttempt, 0), 10); 
                setFocusEnable(true);

              }, 1600);
              
        }
      }
    }
  };

  const handleVirtualKey = (key: string) => {
    if (key === '⌫') {
      handleKeyPress('Backspace');
    } else if (key === '↵') {
      handleKeyPress('Enter');
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
    <h1>Decifra</h1>
    <div className="tituloInputs">
      {guesses.map((row, rowIndex) => (
        <div className="container-inputs" key={rowIndex}>
          {row.map((letter, colIndex) => {
            const isActiveRow = rowIndex === currentAttempt;
            const status = statuses[rowIndex][colIndex];
            const delay = `${colIndex * 300}ms`;
            return (
              <input
                key={colIndex}
                type="text"
                ref={(el) => {
                    inputRefs.current[rowIndex][colIndex] = el;
                  }}
                className={`letter-box ${status} ${status ? 'spin' : ''} ${focusEnabled ? 'focus-visible' : ''}`}
                style={{ animationDelay: delay }}
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
      const status = keyboardStatus[key.toUpperCase()];
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
      const status = keyboardStatus[key.toUpperCase()];
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
    <button className="key wide" onClick={() => handleVirtualKey('↪')}>↪</button>
    {'ZXCVBNM'.split('').map((key, i) => {
      const status = keyboardStatus[key.toUpperCase()];
      return (
        <React.Fragment key={key}>
          <button
            className={`key ${status || ''}`}
            onClick={() => handleVirtualKey(key)}
          >
            {key}
          </button>
          {key === 'M' && (
            <button className="key wide" onClick={() => handleVirtualKey('⌫')}>⌫</button>
          )}
        </React.Fragment>
      );
    })}
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
