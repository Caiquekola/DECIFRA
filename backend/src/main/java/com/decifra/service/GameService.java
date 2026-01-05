package com.decifra.service;

import com.decifra.dto.GameResultRequest;
import com.decifra.dto.GameStartResponse;
import com.decifra.model.GameSession;
import com.decifra.model.Guess;
import com.decifra.model.Word;
import com.decifra.repository.GameSessionRepository;
import com.decifra.repository.GuessRepository;
import com.decifra.repository.WordRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GameService {


    private final GameSessionRepository sessionRepository;
    private final WordRepository wordRepository;
    private final GuessRepository guessRepository;

    public GameStartResponse startClientSideGame(String userId, int length) {
        GameSession session = new GameSession();
        session.setUserId(userId);

        Word randomWord = wordRepository.findRandomWordByLength(length);
        String target = (randomWord != null) ? randomWord.getText() : "TERMO";
        session.setTargetWord(target);

        sessionRepository.save(session);

        // 2. Retorna a palavra pro front validar localmente
        GameStartResponse response = new GameStartResponse();
        response.setSessionId(session.getId());
        response.setTargetWord(target);
        response.setWordLength(5);

        return response;
    }

    public void saveGameResult(GameResultRequest request) {
        GameSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow();

        session.setWon(request.isWon());
        session.setEndTime(LocalDateTime.now());
        session.setAttemptsCount(request.getAttemptsUsed());
        session.setDurationSeconds(request.getDurationMs() / 1000);

        sessionRepository.save(session);

        try {
            ObjectMapper mapper = new ObjectMapper();
            List<List<String>> history = mapper.readValue(request.getHistoryJson(), new TypeReference<>() {
            });


            int attemptNum = 1;
            for (Object row : history) {
                String wordStr = "";
                if (row instanceof List) {
                    wordStr = String.join("", (List<String>) row);
                } else {
                    wordStr = row.toString();
                }

                Guess guess = new Guess();
                guess.setGameSession(session);
                guess.setAttemptNumber(attemptNum++);
                guess.setWord(wordStr);
                guess.setTimestamp(LocalDateTime.now());
                guessRepository.save(guess);
            }
        } catch (Exception e) {
            System.err.println("Erro ao salvar histórico de palpites: " + e.getMessage());
        }
    }

}