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

    private String userId; // Pode ser um UUID gerado no front ou IP (simplificado)

    @Column(length = 5, nullable = false)
    private String targetWord; // A palavra secreta (ex: "TERMO")

    private boolean won; // Se ganhou ou perdeu

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    // Relacionamento 1:N (Uma partida tem várias tentativas)
    @OneToMany(mappedBy = "gameSession", cascade = CascadeType.ALL)
    private List<Guess> guesses;

    @PrePersist
    public void prePersist() {
        this.startTime = LocalDateTime.now();
        this.won = false;
    }
}