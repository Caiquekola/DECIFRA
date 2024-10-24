const palavra = "SORTE";  // Palavra correta




const inputs = document.querySelectorAll('input');
let tentativa = 0;
const btnEnviar = document.querySelector('#submitGuess');

// Função para desabilitar todos os inputs
function desabilitarTodosInputs() {
    inputs.forEach(input => {
        input.disabled = true;
        input.setAttribute('pattern','[A-Za-zÀ-ÿ]*');
        input.setAttribute('title','Números não são permitidos');
        input.addEventListener('input', function() {
            this.value = this.value.replace(/[^A-Za-zÀ-ÿ]/g, ''); // Remove números digitados
        });
        
    });
}

// Função para habilitar a linha atual
function habilitarLinha(tentativaAtual) {
    const startIndex = tentativaAtual * 5;
    const endIndex = startIndex + 5;

    for (let i = startIndex; i < endIndex; i++) {
        inputs[i].disabled = false;
        inputs[i].setAttribute('pattern','[A-Za-zÀ-ÿ]*');
        
        inputs[i].setAttribute('title', 'Somente letras são permitidas');
        
    }

}

// Função para enviar a resposta
function enviarResposta() {
    const inputInicial = tentativa * 5;
    let palavraTentada = '';

    // Montar a palavra tentada e verificar se todos os campos estão preenchidos
    for (let i = inputInicial; i < (inputInicial + 5); i++) {
        if (!inputs[i].value) {
            alert('Preencha todos os campos!');
            return;
        }
        palavraTentada += inputs[i].value.toUpperCase();
    }

    // Aplicar animação de giro com atraso incremental
    for (let i = 0; i < 5; i++) {
        const input = inputs[inputInicial + i];
        input.style.animationDelay = `${i * 300}ms`;  // Atraso incremental
        input.classList.add('spin');  // Adiciona classe de animação
    }

    // Esperar a animação de giro antes de verificar as letras
    setTimeout(() => {
        for (let i = 0; i < 5; i++) {
            const letraTentada = palavraTentada[i];
            const input = inputs[inputInicial + i];

            if (letraTentada === palavra[i]) {
                input.style.backgroundColor = 'green';
            } else if (palavra.includes(letraTentada)) {
                input.style.backgroundColor = 'orange';
            } else {
                input.style.backgroundColor = 'gray';
            }
        }

        tentativa++;

        // Verificar vitória ou término do jogo
        if (palavraTentada === palavra) {
            // Mostrar a palavra correta toda em verde
            for (let i = inputInicial; i < (inputInicial + 5); i++) {
                inputs[i].style.backgroundColor = 'green';
            }

            // Exibir o pop-up após 1 segundo
            setTimeout(() => {
                alert('Você acertou!');
                btnEnviar.disabled = true;
            }, 1000);
        } else if (tentativa === 6) {
            alert('A palavra era '+palavra);
            btnEnviar.disabled = true;
        } else {
            // Desabilitar a linha atual e habilitar a próxima linha
            desabilitarTodosInputs();
            habilitarLinha(tentativa);

            // Focar no primeiro input da nova linha
            const firstInputOfNextLine = inputs[tentativa * 5];
            if (firstInputOfNextLine) {
                firstInputOfNextLine.focus();
            }
        }
    }, 1000);  // Tempo da animação de giro
}

btnEnviar.addEventListener('click', enviarResposta);

// Adicionar evento de "Enter" para enviar resposta
inputs.forEach(input => {
    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            enviarResposta();
        }
    });
});

// Adicionar evento de foco automático ao digitar
inputs.forEach((input, index) => {
    input.addEventListener('input', () => {
        if (input.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();  // Pular para o próximo input
        }
    });
});
inputs.forEach((input, index) => {
    input.addEventListener('keydown', function(event) {
        if (event.key === 'Backspace' && input.value === '') {
            if (index > 0) {
                inputs[index - 1].focus();
                inputs[index - 1].value = '';  // Apaga o valor do campo anterior
            }
        } else if (event.key === 'Enter') {
            enviarResposta();
        }
    });
});
// Inicializar jogo desabilitando todos os inputs e habilitando a primeira linha
desabilitarTodosInputs();
habilitarLinha(0);
