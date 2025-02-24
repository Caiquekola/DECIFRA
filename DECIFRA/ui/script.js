const palavra = "ALEXA";  // Palavra correta

const inputs = document.querySelectorAll('input');
let tentativa = 0;
const btnEnviar = document.querySelector('#submitGuess');

// Configurar os inputs na inicialização
function configurarInputs() {
    inputs.forEach(input => {
        input.disabled = true;
        input.setAttribute('pattern', '[A-Za-zÀ-ÿ]*');
        input.setAttribute('title', 'Somente letras são permitidas');
        
        // Remover números automaticamente e pular para o próximo input
        input.addEventListener('input', () => {
            input.value = input.value.replace(/[^A-Za-zÀ-ÿ]/g, '');
            if (input.value.length === 1) focarProximoInput(input);
        });
    });
}

// Focar no próximo input ou voltar ao anterior com Backspace
function focarProximoInput(inputAtual) {
    const index = Array.from(inputs).indexOf(inputAtual);
    if (index < inputs.length - 1) inputs[index + 1].focus();
}

// Focar input anterior ao apagar com Backspace
function voltarInputAnterior(event, index) {
    if (event.key === 'Backspace' && inputs[index].value === '' && index > 0) {
        inputs[index - 1].focus();
    }
}

// Desabilitar todos os inputs e habilitar apenas a linha da tentativa atual
function habilitarLinhaAtual() {
    inputs.forEach(input => (input.disabled = true));
    const startIndex = tentativa * 5;
    const endIndex = startIndex + 5;
    for (let i = startIndex; i < endIndex; i++) {
        inputs[i].disabled = false;
        inputs[i].addEventListener('keydown', detectarEnter);
    }
    inputs[startIndex].focus();
}

// Detectar a tecla Enter
function detectarEnter(event) {
    if (event.key === 'Enter') enviarResposta();
}

// Função para enviar a resposta
function enviarResposta() {
    const inputInicial = tentativa * 5;
    let palavraTentada = '';

    for (let i = inputInicial; i < inputInicial + 5; i++) {
        if (!inputs[i].value) return alert('Preencha todos os campos!');
        palavraTentada += inputs[i].value.toUpperCase();
    }

    // Aplicar animação de giro
    Array.from(inputs).slice(inputInicial, inputInicial + 5).forEach((input, i) => {
        input.style.animationDelay = `${i * 210}ms`;
        input.classList.add('spin');
    });

    // Verificar letras após a animação
    setTimeout(() => {
        for (let i = 0; i < 5; i++) {
            const input = inputs[inputInicial + i];
            input.style.backgroundColor = palavra[i] === palavraTentada[i] ? 'green' : 
                                           palavra.includes(palavraTentada[i]) ? 'orange' : 'gray';
        }

        if (palavraTentada === palavra) {
            setTimeout(() => alert('Você acertou!'), 1000);
            btnEnviar.disabled = true;
        } else if (++tentativa === 5) {
            alert(`A palavra era ${palavra}`);
            btnEnviar.disabled = true;
        } else {
            habilitarLinhaAtual();
        }
    }, 1600);
}

// Eventos de controle dos inputs
btnEnviar.addEventListener('click', enviarResposta);
inputs.forEach((input, index) => input.addEventListener('keydown', event => voltarInputAnterior(event, index)));

// Inicializar o jogo
configurarInputs();
habilitarLinhaAtual();

