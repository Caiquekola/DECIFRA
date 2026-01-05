package com.decifra.dto;

import lombok.Data;

@Data
public class GameStartResponse {
    private Long sessionId;
    private String targetWord; 
    private int wordLength;
}
