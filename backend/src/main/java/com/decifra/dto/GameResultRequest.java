package com.decifra.dto;

import lombok.Data;

@Data
public class GameResultRequest {
    private Long sessionId;
    private boolean won;
    private int attemptsUsed;
    private long durationMs; 
    private String historyJson; 
}
