package com.decifra.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "guesses")
public class Guess {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "game_session_id")
    private GameSession gameSession;

    @Column(length = 5)
    private String word; // A palavra chutada (ex: "BANJO")

    private int attemptNumber; // 1, 2, 3...

    // Armazena o resultado como JSON string simples para facilitar
    // Ex: "G,Y,X,X,G" (Green, Yellow, Gray)
    private String resultPattern; 
    
    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        this.timestamp = LocalDateTime.now();
    }
}