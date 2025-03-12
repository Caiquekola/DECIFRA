import React, { useState } from 'react';
import Header from '../components/header'; // Supondo que você tenha esse componente

const Home: React.FC = () => {
  const [inputs, setInputs] = useState<string[]>(Array(5).fill(''));

  const handleInputChange = (index: number, value: string) => {
    const newInputs = [...inputs];
    newInputs[index] = value.toUpperCase();
    setInputs(newInputs);
  };

  return (
    <div className="container">
      <Header />
      <div id="game-container">
        {Array.from({ length: 5 }).map((_, index) => (
          <input
            key={index}
            type="text"
            maxLength={1}
            value={inputs[index]}
            onChange={(e) => handleInputChange(index, e.target.value)}
          />
        ))}
        <button id="submitGuess">Enviar</button>
      </div>
    </div>
  );
};

export default Home;
