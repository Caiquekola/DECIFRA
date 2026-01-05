package com.decifra.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Entity
@Table(name = "game_sessions")
public class GameSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userId;

    @Column(nullable = false)
    private String targetWord; // A palavra secreta (ex: "TERMO")
    @Column(name = "attempts_count")
    private Integer attemptsCount; // Quantas tentativas usou (1 a 6)

    @Column(name = "duration_seconds")
    private Long durationSeconds; 
    private boolean won;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @PrePersist
    public void prePersist() {
        this.startTime = LocalDateTime.now();
        this.won = false;
    }
}