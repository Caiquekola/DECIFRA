-- 1. Limpar dados antigos para começar do zero
TRUNCATE TABLE guesses CASCADE;
TRUNCATE TABLE game_sessions CASCADE;

-- 2. Inserir VITÓRIAS (70% do total)
-- Vamos distribuir as vitórias para preencher o gráfico de 1 a 6
INSERT INTO game_sessions (user_id, target_word, won, attempts_count, duration_seconds, start_time, end_time)
SELECT 
    'user_win_' || floor(random() * 1000), -- User ID
    CASE 
        WHEN random() < 0.5 THEN 'TERMO' 
        ELSE 'AUDIO' 
    END, -- Palavra Alvo
    true, -- Ganhou
    -- Distribuição Normal de Tentativas:
    -- 1 (5%), 2 (10%), 3 (25%), 4 (35%), 5 (15%), 6 (10%)
    CASE 
        WHEN random() < 0.05 THEN 1
        WHEN random() < 0.15 THEN 2
        WHEN random() < 0.40 THEN 3
        WHEN random() < 0.75 THEN 4
        WHEN random() < 0.90 THEN 5
        ELSE 6
    END,
    floor(random() * 180 + 30), -- Tempo: 30s a 3min
    NOW() - interval '1 day',
    NOW()
FROM generate_series(1, 150); -- 150 vitórias

-- 3. Inserir DERROTAS (30% do total)
INSERT INTO game_sessions (user_id, target_word, won, attempts_count, duration_seconds, start_time, end_time)
SELECT 
    'user_loss_' || floor(random() * 1000),
    CASE 
        WHEN random() < 0.3 THEN 'ALEXYA' 
        WHEN random() < 0.6 THEN 'RITMO'
        ELSE 'GNOMO' 
    END, -- Palavras difíceis
    false, -- Perdeu
    -- Derrotas geralmente ocorrem na tentativa 6, ou abandono na 3/4
    CASE 
        WHEN random() < 0.2 THEN 3 -- Abandono cedo
        WHEN random() < 0.4 THEN 4 -- Abandono médio
        WHEN random() < 0.5 THEN 5 -- Abandono tarde
        ELSE 6                     -- Perda real
    END,
    floor(random() * 300 + 60),
    NOW() - interval '2 day',
    NOW()
FROM generate_series(1, 50); -- 50 derrotas

-- 4. Popular a tabela de Guesses (Palavras de Abertura) para o gráfico novo
-- Simula que todo mundo começa com palavras famosas
INSERT INTO guesses (game_session_id, word, attempt_number, timestamp)
SELECT 
    id,
    CASE 
        WHEN random() < 0.35 THEN 'AUDIO'
        WHEN random() < 0.60 THEN 'SAIRA'
        WHEN random() < 0.80 THEN 'TERMO'
        WHEN random() < 0.90 THEN 'FESTA'
        ELSE 'PORTA'
    END,
    1, -- Tentativa 1
    start_time
FROM game_sessions;