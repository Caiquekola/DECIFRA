package com.decifra.service;

import com.decifra.dto.GameResultRequest;
import com.decifra.dto.GameStartResponse;
import com.decifra.dto.GuessResponse;
import com.decifra.model.GameSession;
import com.decifra.model.Guess;
import com.decifra.model.Word;
import com.decifra.repository.GameSessionRepository;
import com.decifra.repository.GuessRepository; // Crie esta interface!
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

        sessionRepository.save(session);
    }

}