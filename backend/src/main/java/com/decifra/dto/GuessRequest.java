package com.decifra.dto;

import lombok.Data;

@Data
public class GuessRequest {
    private Long sessionId;
    private String guessWord;
}