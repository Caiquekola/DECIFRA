package com.decifra.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Table(name = "words")
@NoArgsConstructor
@AllArgsConstructor
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 20)
    private String text;

    @Column(nullable = false)
    private Integer length;

    // Hook do JPA: Executa automaticamente antes de salvar no banco.
    // Garante que a palavra esteja sempre em MAIÚSCULO e preenche o tamanho.
    @PrePersist
    @PreUpdate
    public void prepareData() {
        if (this.text != null) {
            // Remove acentos (opcional, se quiser salvar puro) e espaços
            // Para manter simples aqui, só garantimos Uppercase e Trim
            this.text = this.text.trim().toUpperCase();
            this.length = this.text.length();
        }
    }
}