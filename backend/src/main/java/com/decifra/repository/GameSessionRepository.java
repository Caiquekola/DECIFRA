package com.decifra.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.decifra.model.GameSession;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {


    // Top 10 Palavras Alvo Mais Difíceis (Que geraram derrota)
    @Query("SELECT s.targetWord, COUNT(s) as losses FROM GameSession s WHERE s.won = false GROUP BY s.targetWord ORDER BY losses DESC LIMIT 10")
    List<Object[]> findHardestWords();

    // Gráfico: Vitórias por Tentativa (Já tínhamos)
    @Query("SELECT s.attemptsCount, COUNT(s) FROM GameSession s WHERE s.won = true GROUP BY s.attemptsCount ORDER BY s.attemptsCount")
    List<Object[]> countWinsByAttempts();

    // NOVO Gráfico: Derrotas por Tentativa (Para medir abandono)
    @Query("SELECT s.attemptsCount, COUNT(s) FROM GameSession s WHERE s.won = false GROUP BY s.attemptsCount ORDER BY s.attemptsCount")
    List<Object[]> countLossesByAttempts();

    // Gráfico: Pizza (Win/Loss)
    @Query("SELECT s.won, COUNT(s) FROM GameSession s GROUP BY s.won")
    List<Object[]> countWinVsLoss();

    @Query("SELECT COALESCE(AVG(s.durationSeconds), 0) FROM GameSession s WHERE s.won = true")
    Double getAvgDuration();

    @Query("SELECT COALESCE(MAX(s.durationSeconds), 0) FROM GameSession s")
    Long getMaxDuration();

    @Query("SELECT COALESCE(MIN(s.durationSeconds), 0) FROM GameSession s WHERE s.durationSeconds > 0")
    Long getMinDuration();
}