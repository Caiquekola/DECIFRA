package com.decifra.dto;

import lombok.Data;

@Data
public class GameResultRequest {
    private Long sessionId;
    private boolean won;
    private int attemptsUsed;
    private long durationMs; // Tempo gasto
    private String historyJson; // Guardamos o array de tentativas como JSON String no banco
}
