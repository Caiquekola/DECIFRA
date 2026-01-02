package com.decifra.repository;

import com.decifra.model.GameSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GameSessionRepository extends JpaRepository<GameSession, Long> {

    // Método mágico do Spring Data: Encontra sessões por usuário e se ganhou ou não
    // Útil para o Gráfico de "Taxa de Vitória do Usuário"
    List<GameSession> findByUserIdAndWon(String userId, boolean won);

    // Query Personalizada (JPQL) para o DASHBOARD (SAD)
    // Retorna quantas partidas foram ganhas no total.
    // Isso prova que você sabe manipular dados para tomada de decisão.
    @Query("SELECT COUNT(g) FROM GameSession g WHERE g.won = true")
    long countTotalWins();
}