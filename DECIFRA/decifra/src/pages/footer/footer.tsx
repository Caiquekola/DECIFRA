import './footer.css';

function Footer(): React.ReactElement {
    const startDate =  new Date('2025-08-01');  
    const today = new Date();
    var diffMs = today.getTime()-startDate.getTime();
    // Retorna em milisegundos sempre então tem que fazer a conversão
    var diffDays = Math.ceil(diffMs/ (1000*60*60*24));
    return (
        <>
            <footer>
                <div>
                    <h1>
                        <a href="https://www.caiquekola.com.br/">
                             Dia {diffDays} - Decifra © 2025
                        </a>
                    </h1>
                    
                </div>
                    
            </footer>
        </>)
}

export default Footer;