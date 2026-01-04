import React from 'react';
import './end-modal.css';

type EndModalProps = {
  open: boolean;
  won: boolean;
  solution: string;         // palavra do dia (com acento)
  shareGrid: string;        // texto do grid de compartilhamento
  onShare: () => void;
  onPlayYesterday: () => void;
  onSecondAction: () => void;
  onClose: () => void;
};

export default function EndModal({
  open,
  won,
  solution,
  shareGrid,
  onShare,
  onPlayYesterday,
  onSecondAction,
  onClose,
}: EndModalProps) {
  if (!open) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{won ? '🎉 Parabéns!' : '🏁 Fim de jogo'}</h2>

        <p className="solution">
          Palavra do dia: <strong>{solution}</strong>
        </p>

        <div className="share-block">
          <p className="share-title">Seu resultado:</p>
          <pre className="share-grid">{shareGrid}</pre>
          <button onClick={onShare}>Compartilhar</button>
        </div>

        <div className="end-buttons">
          <button className="secondary" onClick={onPlayYesterday}>
            Jogar o dia de ontem
          </button>
          <button className="secondary" onClick={onSecondAction}>
            Segundo botão (em breve)
          </button>
          <button className="ghost" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
