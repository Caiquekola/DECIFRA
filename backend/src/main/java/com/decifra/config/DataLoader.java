package com.decifra.config;

import com.decifra.model.Word;
import com.decifra.repository.WordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.BufferedReader;
import java.io.InputStreamReader;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final WordRepository wordRepository;

    @Override
    public void run(String... args) throws Exception {
        if (wordRepository.count() == 0) {
            System.out.println("--- Iniciando importação de palavras ---");
            
            // Lê o arquivo resources/palavras.txt
            ClassPathResource resource = new ClassPathResource("palavras.txt");
            BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream()));
            
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.trim().length() >= 5) {
                    Word word = new Word();
                    word.setText(line.trim().toUpperCase());
                    try {
                        wordRepository.save(word);
                    } catch (Exception e) {
                        // Ignora duplicadas
                    }
                }
            }
            System.out.println("--- Importação concluída! Total: " + wordRepository.count() + " ---");
        }
    }
}