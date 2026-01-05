package com.decifra.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.decifra.dto.GameResultRequest;
import com.decifra.dto.GameStartResponse;
import com.decifra.dto.StartGameRequest; // Importando do pacote correto
import com.decifra.service.GameService;

import lombok.RequiredArgsConstructor;


@RestController
@RequestMapping("/game")
@CrossOrigin(origins = "*") 
@RequiredArgsConstructor 
public class GameController {

    private final GameService gameService;

    @GetMapping("/")
    public String getAPI() {
        return "Decifra API";
    }
    

    // Inicia o jogo e entrega a palavra para o cliente
    @PostMapping("/start")
    public ResponseEntity<GameStartResponse> startGame(@RequestBody StartGameRequest request) {
        return ResponseEntity.ok(gameService.startClientSideGame(request.getUserId(),request.getWordLength()));
    }

    // Recebe o relatório final para o SAD (Sistema de Apoio à Decisão)
    @PostMapping("/finish")
    public ResponseEntity<Void> finishGame(@RequestBody GameResultRequest request) {
        gameService.saveGameResult(request);
        return ResponseEntity.ok().build();
    }
}

