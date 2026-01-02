package com.decifra.controller;

import com.decifra.dto.GuessRequest;   // Importando do pacote correto
import com.decifra.dto.GuessResponse;  // Importando do pacote correto
import com.decifra.dto.StartGameRequest; // Importando do pacote correto
import com.decifra.model.GameSession;
import com.decifra.service.GameService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/game")
@CrossOrigin(origins = "*") 
@RequiredArgsConstructor 
public class GameController {

    private final GameService gameService;

    @PostMapping("/start")
    public ResponseEntity<GameSession> startGame(@RequestBody StartGameRequest request) {
        GameSession session = gameService.startNewGame(request.getUserId());
        return ResponseEntity.ok(session);
    }

    @PostMapping("/guess")
    public ResponseEntity<GuessResponse> makeGuess(@RequestBody GuessRequest request) {
        
        GuessResponse response = gameService.processGuess(
            request.getSessionId(), 
            request.getGuessWord()
        );
        
        return ResponseEntity.ok(response);
    }
}

