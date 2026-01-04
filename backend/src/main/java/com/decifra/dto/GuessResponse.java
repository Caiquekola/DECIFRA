package com.decifra.dto;

import lombok.Data;

@Data
public class GuessResponse {
    private String resultPattern; // Ex: "VVCAV"
    private boolean won;
    private boolean gameOver;
    private int attemptsUsed;
}