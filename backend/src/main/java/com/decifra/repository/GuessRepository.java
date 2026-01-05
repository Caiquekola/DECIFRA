package com.decifra.repository;

import com.decifra.model.Guess;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

public interface GuessRepository extends JpaRepository<Guess, Long> {

    // Top 10 Palavras de Abertura (Tentativa #1)
    @Query("SELECT g.word, COUNT(g) as qtd FROM Guess g WHERE g.attemptNumber = 1 GROUP BY g.word ORDER BY qtd DESC LIMIT 10")
    List<Object[]> findTopStartingWords();
    
    // Top 10 Palavras Mais Usadas (Geral)
    @Query("SELECT g.word, COUNT(g) as qtd FROM Guess g GROUP BY g.word ORDER BY qtd DESC LIMIT 10")
    List<Object[]> findMostGuessedWords();
}