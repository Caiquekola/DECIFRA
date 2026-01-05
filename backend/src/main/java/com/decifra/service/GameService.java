package com.decifra.service;

import com.decifra.dto.GuessResponse;
import com.decifra.model.GameSession;
import com.decifra.model.Guess;
import com.decifra.model.Word;
import com.decifra.repository.GameSessionRepository;
import com.decifra.repository.GuessRepository;
import com.decifra.repository.WordRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GameService {

    private final GameSessionRepository sessionRepository;
    private final GuessRepository guessRepository;
    private final WordRepository wordRepository;

    @Transactional
    public GameSession startNewGame(String userId) {
        GameSession session = new GameSession();
        session.setUserId(userId);

        Word randomWord = wordRepository.findRandomWord();
        if (randomWord == null) {
            session.setTargetWord("TERMO"); // Fallback caso o banco esteja vazio
        } else {
            session.setTargetWord(randomWord.getText());
        }

        return sessionRepository.save(session);
    }

    /**
     * Processa a tentativa, aplica as regras do jogo e salva no banco.
     * Este método é o coração do SAD (Sistema de Apoio à Decisão), pois gera os
     * dados.
     */
    @Transactional
    public GuessResponse processGuess(Long sessionId, String guessWord) {
        // 1. Busca a Sessão
        GameSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("Sessão não encontrada"));

        // 2. Validações Básicas
        if (session.isWon() || session.getGuesses().size() >= 6) {
            throw new IllegalStateException("O jogo já acabou.");
        }
        if (guessWord == null || guessWord.length() != 5) {
            throw new IllegalArgumentException("A palavra deve ter 5 letras.");
        }

        String target = session.getTargetWord().toUpperCase();
        String guess = guessWord.toUpperCase();

        // 3. Algoritmo de Comparação (Lógica do Wordle)
        // Retorna array de status: ["correct", "absent", "present", "correct",
        // "absent"]
        List<String> resultPattern = calculateMatch(target, guess);

        // 4. Verifica Vitória
        boolean won = guess.equals(target);

        // 5. Salva a Tentativa (Essencial para os gráficos do dashboard)
        Guess newGuess = new Guess();
        newGuess.setGameSession(session);
        newGuess.setWord(guess);
        newGuess.setAttemptNumber(session.getGuesses().size() + 1);
        // Transforma a lista em String CSV simples para salvar no banco (ex:
        // "correct,absent...")
        newGuess.setResultPattern(String.join(",", resultPattern));

        guessRepository.save(newGuess);

        // 6. Atualiza a Sessão
        if (won) {
            session.setWon(true);
            session.setEndTime(LocalDateTime.now());
        } else if (newGuess.getAttemptNumber() >= 6) {
            // Perdeu por limite de tentativas
            session.setEndTime(LocalDateTime.now());
        }
        sessionRepository.save(session);

        // 7. Monta o DTO de Resposta
        GuessResponse response = new GuessResponse();
        response.setResultPattern(String.join(",", resultPattern));
        response.setWon(session.isWon());
        response.setGameOver(session.getEndTime() != null);
        response.setAttemptsUsed(newGuess.getAttemptNumber());

        return response;
    }

    /**
     * Algoritmo auxiliar para calcular as cores.
     * Separei em método privado seguindo o princípio SRP (Single Responsibility).
     */
    private List<String> calculateMatch(String target, String guess) {
        String[] result = new String[5];
        char[] targetChars = target.toCharArray();
        char[] guessChars = guess.toCharArray();
        boolean[] targetUsed = new boolean[5]; // Marca letras do alvo já "usadas"

        // Passo 1: Identificar VERDES (Posição exata - "correct")
        for (int i = 0; i < 5; i++) {
            if (guessChars[i] == targetChars[i]) {
                result[i] = "correct";
                targetUsed[i] = true; // Essa letra do alvo já achou seu par
            }
        }

        // Passo 2: Identificar AMARELOS (Letra existe mas posição errada - "present")
        // e CINZAS (Não existe ou já foi usada - "absent")
        for (int i = 0; i < 5; i++) {
            if (result[i] != null)
                continue; // Já é verde

            boolean found = false;
            for (int j = 0; j < 5; j++) {
                // Se a letra bate, e a posição j do alvo ainda não foi usada por um verde ou
                // outro amarelo
                if (!targetUsed[j] && targetChars[j] == guessChars[i]) {
                    result[i] = "present";
                    targetUsed[j] = true;
                    found = true;
                    break;
                }
            }

            if (!found) {
                result[i] = "absent";
            }
        }

        return List.of(result);
    }
}