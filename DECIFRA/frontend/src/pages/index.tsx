import React, { useState, useEffect, KeyboardEvent } from 'react';
import Header from '../components/header';

const palavra = 'ALEXA';

const Decifra: React.FC = () => {
  const [tentativa, setTentativa] = useState<number>(0);
  const [inputs, setInputs] = useState<string[]>(Array(25).fill(''));

  useEffect(() => {
    document.getElementById(`input-${tentativa * 5}`)?.focus();
  }, [tentativa]);

  const handleInput = (index: number, value: string) => {
    if (/^[A-Za-zÀ-ÿ]*$/.test(value)) {
      const newInputs = [...inputs];
      newInputs[index] = value.toUpperCase();
      setInputs(newInputs);
      if (value && index < inputs.length - 1) {
        document.getElementById(`input-${index + 1}`)?.focus();
      }
    }
  };

  const handleBackspace = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === 'Backspace' && !inputs[index] && index > 0) {
      document.getElementById(`input-${index - 1}`)?.focus();
    }
  };

  const enviarResposta = () => {
    const startIndex = tentativa * 5;
    const palavraTentada = inputs.slice(startIndex, startIndex + 5).join('');

    if (palavraTentada.length < 5) return alert('Preencha todos os campos!');

    setTimeout(() => {
      if (palavraTentada === palavra) {
        alert('Você acertou!');
      } else if (tentativa === 4) {
        alert(`A palavra era ${palavra}`);
      } else {
        setTentativa(tentativa + 1);
      }
    }, 1600);
  };

  return (
    
    <div className="container">
      <Header></Header>
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <div className="linha" key={rowIndex}>
          {Array.from({ length: 5 }).map((_, colIndex) => {
            const index = rowIndex * 5 + colIndex;
            return (
              <input
                key={index}
                id={`input-${index}`}
                type="text"
                maxLength={1}
                value={inputs[index]}
                disabled={Math.floor(index / 5) !== tentativa}
                onChange={(e) => handleInput(index, e.target.value)}
                onKeyDown={(e) => handleBackspace(e, index)}
              />
            );
          })}
        </div>
      ))}
      <button onClick={enviarResposta}>Enviar</button>
    </div>
  );
};

export default Decifra;