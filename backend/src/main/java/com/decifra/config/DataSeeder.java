package com.decifra.config;

import com.decifra.model.GameSession;
import com.decifra.repository.GameSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Random;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final GameSessionRepository gameSessionRepository;

    @Override
    public void run(String... args) throws Exception {
        // Só gera dados se o banco estiver vazio (para não duplicar)
        if (gameSessionRepository.count() < 100) {
            System.out.println("--- Gerando Massa de Dados Fictícia para o Dashboard ---");
            
            Random random = new Random();
            String[] usuarios = {"user_alpha", "user_beta", "user_gamma", "prof_avaliador"};

            // Vamos gerar 100 partidas
            for (int i = 0; i < 100; i++) {
                GameSession session = new GameSession();
                
                // 1. Usuário Aleatório
                session.setUserId(usuarios[random.nextInt(usuarios.length)]);
                session.setTargetWord("TERMO");
                
                // 2. Define Vitória ou Derrota (80% de chance de vitória)
                boolean won = random.nextDouble() > 0.2; 
                session.setWon(won);
                
                // 3. Define Tentativas (Simulando uma curva normal/realista)
                // É raro acertar de 1ª, comum acertar na 4ª
                int attempts;
                if (won) {
                    // Probabilidades ponderadas para ficar bonito no gráfico
                    int roll = random.nextInt(100);
                    if (roll < 5) attempts = 1;       // 5% chance de acertar na 1ª
                    else if (roll < 15) attempts = 2; // 10% chance
                    else if (roll < 40) attempts = 3; // 25% chance
                    else if (roll < 70) attempts = 4; // 30% chance (Média)
                    else if (roll < 90) attempts = 5; // 20% chance
                    else attempts = 6;                // 10% chance
                } else {
                    attempts = 6; // Se perdeu, usou todas
                }
                session.setAttemptsCount(attempts);

                // 4. Duração (entre 30s e 5 minutos)
                long duration = 30 + random.nextInt(270);
                session.setDurationSeconds(duration);
                
                // Datas passadas (para simular histórico)
                session.setStartTime(LocalDateTime.now().minusDays(random.nextInt(30)));
                session.setEndTime(session.getStartTime().plusSeconds(duration));

                gameSessionRepository.save(session);
            }
            
            System.out.println("--- 100 Partidas Geradas com Sucesso! ---");
        }
    }
}