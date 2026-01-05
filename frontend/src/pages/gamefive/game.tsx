import React, { useEffect, useState, useRef } from 'react';
import axios, { AxiosError } from 'axios';
import './game.css';
import EndModal from '../endgame/EndModal';

// Configuração da API baseada no seu Controller Java (@RequestMapping("/game"))
const API_URL = 'http://localhost:8080/api/game';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

// Função auxiliar de normalização
const norm = (s: string) => s ? s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toUpperCase() : "";

function Game(): React.ReactElement {
  // --- ESTADOS ---
  // Dados vindos do Backend
  const [targetWord, setTargetWord] = useState<string>(''); 
  const [sessionId, setSessionId] = useState<number | null>(null);
  
  // Controle de tempo
  const [startTime, setStartTime] = useState<number>(0);

  // Estados Visuais e de Jogo
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
  const [focusEnabled, setFocusEnable] = useState(false); // Começa travado até carregar a API
  const [keyboardStatus, setKeyboardStatus] = useState<{ [key: string]: string }>({});
  
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array(MAX_ATTEMPTS).fill(null).map(() => Array(WORD_LENGTH).fill(null))
  );

  // Função para desistir intencionalmente
  const handleGiveUp = () => {
    if (gameOver) return;
    
    if (window.confirm("Tem certeza que deseja desistir desta partida?")) {
      finishGame(false, currentAttempt + 1);
    }
  };

  // --- 1. INICIALIZAÇÃO DO JOGO ---
  useEffect(() => {
    const initGame = async () => {
      try {
        // Gerenciamento simples de ID de usuário
        let userId = localStorage.getItem('decifra_user_id');
        if (!userId) {
          userId = 'user_' + Math.floor(Math.random() * 100000);
          localStorage.setItem('decifra_user_id', userId);
        }

        // Chama o endpoint Java: /game/start
        const response = await axios.post(`${API_URL}/start`, { 
            userId: userId,
            wordLength: WORD_LENGTH 
        });
        
        // Configura o jogo com a resposta
        setSessionId(response.data.sessionId);
        setTargetWord(response.data.targetWord); // Guarda a palavra secreta localmente
        setStartTime(Date.now());
        console.log(response.data.targetWord);
        // Libera o jogo
        setFocusEnable(true);
        setTimeout(() => focusInput(0, 0), 100);

      } catch (error) {
        console.error("Erro ao conectar no servidor:", error);
        alert("Erro ao iniciar. Verifique se o Backend Java está rodando na porta 8080.");
      }
    };

    // Foca no input inicial
    focusInput(0, 0);
    initGame();
  }, []);

  const focusInput = (row: number, col: number) => {
    if (inputRefs.current[row] && inputRefs.current[row][col]) {
      inputRefs.current[row][col]?.focus();
    }
  };

  // --- LÓGICA DE VALIDAÇÃO (O Cérebro do Frontend) ---
  const calculateMatch = (guess: string, target: string) => {
    const result = Array(WORD_LENGTH).fill('absent');
    const guessArr = norm(guess).split('');
    const targetArr = norm(target).split('');
    const targetUsed = Array(WORD_LENGTH).fill(false);

    // Passo 1: Identificar VERDES (Posição exata)
    guessArr.forEach((char, i) => {
      if (char === targetArr[i]) {
        result[i] = 'correct';
        targetUsed[i] = true;
      }
    });

    // Passo 2: Identificar AMARELOS (Letra existe mas lugar errado)
    guessArr.forEach((char, i) => {
      if (result[i] === 'correct') return; // Já resolveu

      // Procura a letra no alvo, desde que não tenha sido usada
      const foundIndex = targetArr.findIndex((tChar, tIndex) => 
        tChar === char && !targetUsed[tIndex]
      );

      if (foundIndex !== -1) {
        result[i] = 'present';
        targetUsed[foundIndex] = true; // Marca como usada para não repetir amarelo
      }
    });

    return result;
  };

  // --- FINALIZAR JOGO ---
  const finishGame = async (isVictory: boolean, attempts: number) => {
    setWon(isVictory);
    setGameOver(true);
    setEndModalOpen(true);

    if (sessionId) {
      try {
        await axios.post(`${API_URL}/finish`, {
          sessionId: sessionId,
          won: isVictory,
          attemptsUsed: attempts,
          durationMs: Date.now() - startTime,
          historyJson: JSON.stringify(guesses.slice(0, attempts))
        });
      } catch (err) {
        console.error("Erro ao salvar estatísticas", err);
      }
    }
  };

  const closeEndModal = () => setEndModalOpen(false);

  // --- INPUTS FÍSICOS ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      // Não previne default globalmente para não bloquear F5/F12, apenas nas chaves do jogo
      
      if (key === 'Backspace') {
        e.preventDefault();
        handleKeyPress('Backspace');
      } else if (key === 'Enter') {
        e.preventDefault();
        handleKeyPress('Enter');
      } else if (/^[a-zA-ZçÇáàâãéèêíïóôõöúñÁÀÂÃÉÈÊÍÏÓÔÕÖÚÑ]$/.test(key) && key.length === 1) {
        e.preventDefault();
        handleKeyPress(key);
      } else if (key === ' ' || key === 'Space') {
         e.preventDefault();
         // Opcional: tratar espaço
      } else if (key === 'ArrowLeft') {
         // Opcional: navegação
      } else if (key === 'ArrowRight') {
         // Opcional: navegação
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }); // Dependências removidas para simular comportamento original, mas ideal seria incluir deps.

  // --- LÓGICA PRINCIPAL DE DIGITAÇÃO ---
  const handleKeyPress = (key: string) => {
    if (gameOver || !focusEnabled) return;

    const newGuesses = [...guesses];

    // 1. Digitação de letras
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

    // 2. Backspace
    if (key === 'Backspace') {
      if (newGuesses[currentAttempt][currentIndex]) {
        // Apaga atual
        newGuesses[currentAttempt][currentIndex] = '';
        setGuesses(newGuesses);
      } else if (currentIndex > 0) {
        // Volta e apaga anterior
        const prev = currentIndex - 1;
        newGuesses[currentAttempt][prev] = '';
        setGuesses(newGuesses);
        setCurrentIndex(prev);
        setTimeout(() => focusInput(currentAttempt, prev), 0);
      }
      return;
    }

    // 3. ENTER - Validação e Animação
    if (key === 'Enter') {
      const guessArray = newGuesses[currentAttempt];
      const isFull = guessArray.every(ch => ch && ch.length > 0);
      if (!isFull) return; // Só aceita palavra completa

      const guessWord = guessArray.join('');
      
      // Bloqueia input durante animação
      setFocusEnable(false);

      // CALCULA AS CORES LOCALMENTE
      const rowStatuses = calculateMatch(guessWord, targetWord);

      // Animação (Flip)
      const STEP = 300; // Tempo entre cartas
      const FLIP_TIME = 600; // Duração do giro

      // Limpa status da linha atual antes de revelar
      setStatuses((prev) => {
        const copy = prev.map(r => [...r]);
        copy[currentAttempt] = Array(WORD_LENGTH).fill('');
        return copy;
      });

      // Loop de animação carta por carta
      for (let i = 0; i < WORD_LENGTH; i++) {
        setTimeout(() => {
            // Inicia o giro (css .spin)
            setFlips((prev) => {
                const copy = prev.map(r => [...r]);
                copy[currentAttempt][i] = true;
                return copy;
            });

            // Meio do giro: Revela a cor e atualiza teclado
            setTimeout(() => {
                // Para o giro
                setFlips((prev) => {
                    const copy = prev.map(r => [...r]);
                    copy[currentAttempt][i] = false;
                    return copy;
                });

                // Aplica a cor calculada
                setStatuses((prev) => {
                    const copy = prev.map(r => [...r]);
                    copy[currentAttempt][i] = rowStatuses[i];
                    return copy;
                });

                // Atualiza Teclado Virtual
                const k = norm(guessWord[i]);
                const s = rowStatuses[i];
                setKeyboardStatus((prev) => {
                    const cur = prev[k];
                    // Prioridade de cor: Verde > Amarelo > Cinza
                    if (s === 'correct' || (s === 'present' && cur !== 'correct') || (s === 'absent' && !cur)) {
                        return { ...prev, [k]: s };
                    }
                    return prev;
                });

                // Verifica Fim da Tentativa (na última letra)
                if (i === WORD_LENGTH - 1) {
                    setTimeout(() => {
                        const wordIsCorrect = norm(guessWord) === norm(targetWord);
                        
                        if (wordIsCorrect) {
                            finishGame(true, currentAttempt + 1);
                        } else if (currentAttempt === MAX_ATTEMPTS - 1) {
                            finishGame(false, MAX_ATTEMPTS);
                        } else {
                            // Próxima rodada
                            const nextAttempt = currentAttempt + 1;
                            setCurrentAttempt(nextAttempt);
                            setCurrentIndex(0);
                            setTimeout(() => focusInput(nextAttempt, 0), 10);
                            setFocusEnable(true); // Libera input
                        }
                    }, 100);
                }
            }, FLIP_TIME);

        }, i * STEP);
      }
    }
  };

  const handleVirtualKey = (key: string) => {
    if (key === '⌫') {
      handleKeyPress('Backspace');
    } else {
      handleKeyPress(key);
    }
  };

  // Funções de compartilhamento (Mantidas)
  const generateShareGrid = () => {
    return statuses
      .slice(0, currentAttempt + (gameOver ? 1 : 0)) // Mostra até onde jogou
      .map((row) =>
        row.map((s) => {
            if (s === 'correct') return '🟩';
            if (s === 'present') return '🟨';
            if (s === 'absent') return '⬛';
            return '';
          }).join('')
      ).join('\n');
  };
  
  const shareGrid = generateShareGrid();
  const handleShare = async () => {
    const shareText = `Joguei Decifra! 🎉\n\n${shareGrid}`;
    await navigator.clipboard.writeText(shareText);
    alert('Resultado copiado!');
  };
  
  // Mocks para o Modal
  const handlePlayYesterday = () => console.log('Jogar ontem');
  const handleSecondAction = () => console.log('Segundo botão');

  return (
    <>
      <EndModal
        open={endModalOpen}
        won={won}
        solution={targetWord} // Passa a palavra real vinda do Java
        shareGrid={shareGrid}
        onShare={handleShare}
        onPlayYesterday={handlePlayYesterday}
        onSecondAction={handleSecondAction}
        onClose={closeEndModal} 
      />
      
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
                      if(inputRefs.current[rowIndex]) {
                          inputRefs.current[rowIndex][colIndex] = el;
                      }
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
                    }} 
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Teclado Virtual */}
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
            {'ZXCVBNM'.split('').map((key) => {
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
      </div>
    </>
  );
}

export default Game;