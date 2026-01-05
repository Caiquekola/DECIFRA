package com.decifra.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.decifra.repository.GameSessionRepository;
import com.decifra.repository.GuessRepository;
import com.decifra.repository.WordRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class DashboardController {

    private final GameSessionRepository repository;

    private final GameSessionRepository gameSessionRepository;
    private final GuessRepository guessRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        // Gráficos
        stats.put("attemptsWins", repository.countWinsByAttempts());
        stats.put("attemptsLosses", repository.countLossesByAttempts()); // Novo
        stats.put("winLossRatio", repository.countWinVsLoss());

        // KPIs (Cartões de Tempo)
        stats.put("avgTime", repository.getAvgDuration());
        stats.put("maxTime", repository.getMaxDuration());
        stats.put("minTime", repository.getMinDuration());

        stats.put("topOpeningWords", guessRepository.findTopStartingWords());
        stats.put("hardestWords", gameSessionRepository.findHardestWords());
        
        return ResponseEntity.ok(stats);
    }
}